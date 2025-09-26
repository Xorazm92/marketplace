#!/bin/bash
# AWS S3 & CloudFront Setup Script for INBOLA Marketplace
# Production Storage & CDN Configuration

set -e

echo "🚀 Starting AWS S3 & CloudFront setup..."

# Configuration
BUCKET_NAME="inbola-production"
CLOUDFRONT_DOMAIN="cdn.inbola.uz"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# Create S3 bucket
print_status "Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION || print_warning "Bucket already exists"

# Configure bucket policy
print_status "Configuring bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Configure CORS
print_status "Configuring CORS..."
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": [
                "https://inbola.uz",
                "https://www.inbola.uz",
                "https://api.inbola.uz",
                "https://admin.inbola.uz"
            ],
            "ExposeHeaders": ["ETag"]
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json

# Configure bucket lifecycle
print_status "Configuring bucket lifecycle..."
cat > lifecycle-config.json << EOF
{
    "Rules": [
        {
            "ID": "MoveToIA",
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ]
        }
    ]
}
EOF

aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET_NAME --lifecycle-configuration file://lifecycle-config.json

# Create folder structure
print_status "Creating folder structure..."
aws s3api put-object --bucket $BUCKET_NAME --key products/
aws s3api put-object --bucket $BUCKET_NAME --key avatars/
aws s3api put-object --bucket $BUCKET_NAME --key kyc/
aws s3api put-object --bucket $BUCKET_NAME --key categories/
aws s3api put-object --bucket $BUCKET_NAME --key banners/

# Enable versioning
print_status "Enabling bucket versioning..."
aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled

# Create CloudFront distribution
print_status "Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
    "DistributionConfig": {
        "CallerReference": "$(date +%s)",
        "Comment": "INBOLA Marketplace CDN",
        "DefaultRootObject": "index.html",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-$BUCKET_NAME",
                    "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-$BUCKET_NAME",
            "ViewerProtocolPolicy": "redirect-to-https",
            "AllowedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"],
                "CachedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"]
                }
            },
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {
                    "Forward": "none"
                }
            },
            "MinTTL": 0,
            "DefaultTTL": 86400,
            "MaxTTL": 31536000
        },
        "Enabled": true,
        "Aliases": {
            "Quantity": 1,
            "Items": ["$CLOUDFRONT_DOMAIN"]
        }
    }
}
EOF

# Create CloudFront distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
print_status "CloudFront distribution created: $DISTRIBUTION_ID"

# Upload initial files
print_status "Uploading initial files..."
mkdir -p uploads/{products,avatars,kyc,categories,banners}
aws s3 sync ./uploads s3://$BUCKET_NAME --delete

# Configure Cloudinary (optional)
print_status "Setting up Cloudinary..."
cat > cloudinary-config.json << EOF
{
  "cloud_name": "inbola",
  "api_key": "your_cloudinary_api_key",
  "api_secret": "your_cloudinary_api_secret",
  "secure": true,
  "cdn_subdomain": true,
  "secure_cdn_subdomain": true,
  "cname": "cdn.inbola.uz"
}
EOF

# Create monitoring script
cat > monitor-storage.sh << 'EOF'
#!/bin/bash
# Storage monitoring script

echo "=== INBOLA Storage Monitoring ==="
echo "Date: $(date)"
echo ""

# Check S3 bucket
aws s3 ls s3://$BUCKET_NAME --summarize --human-readable | head -20

echo ""
echo "=== CloudFront Distribution ==="
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==\`INBOLA Marketplace CDN\`]' --output table

echo ""
echo "=== Storage Usage ==="
aws s3api list-objects --bucket $BUCKET_NAME --query '[length(Contents), sum(Contents[].Size)]' --output text | awk '{print "Objects: " $1 ", Size: " $2/1024/1024 " MB"}'
EOF

chmod +x monitor-storage.sh

# Create cleanup script
cat > cleanup-storage.sh << 'EOF'
#!/bin/bash
# Storage cleanup script

echo "🧹 Cleaning up old files..."

# Clean old backups (older than 30 days)
aws s3 rm s3://$BUCKET_NAME --recursive --exclude "*" --include "backup/*" --older-than 30

# Clean old logs (older than 7 days)
aws s3 rm s3://$BUCKET_NAME --recursive --exclude "*" --include "logs/*" --older-than 7

echo "✅ Cleanup completed"
EOF

chmod +x cleanup-storage.sh

# Create backup script
cat > backup-storage.sh << 'EOF'
#!/bin/bash
# Storage backup script

BACKUP_BUCKET="inbola-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Creating backup..."

# Sync to backup bucket
aws s3 sync s3://$BUCKET_NAME s3://$BACKUP_BUCKET/backup-$DATE/

# Clean old backups (keep 30 days)
aws s3 ls s3://$BACKUP_BUCKET --recursive | awk '{print $4}' | grep backup- | head -n -30 | xargs -I {} aws s3 rm s3://$BACKUP_BUCKET/{}

echo "✅ Backup completed: backup-$DATE"
EOF

chmod +x backup-storage.sh

# Output configuration
print_status "✅ AWS S3 & CloudFront setup completed!"
echo ""
echo "📋 Configuration Summary:"
echo "   S3 Bucket: s3://$BUCKET_NAME"
echo "   CloudFront Domain: $DISTRIBUTION_ID.cloudfront.net"
echo "   CDN Domain: $CLOUDFRONT_DOMAIN"
echo ""
echo "🔗 Useful Commands:"
echo "   Upload files: aws s3 sync ./uploads s3://$BUCKET_NAME --delete"
echo "   Monitor: ./monitor-storage.sh"
echo "   Backup: ./backup-storage.sh"
echo "   Cleanup: ./cleanup-storage.sh"
echo ""
echo "🔧 Next Steps:"
echo "1. Update DNS A record for $CLOUDFRONT_DOMAIN to point to CloudFront"
echo "2. Configure Cloudinary if using"
echo "3. Test CDN performance"
echo "4. Set up monitoring alerts"
