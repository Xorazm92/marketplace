#!/bin/bash

# ===========================================
# INBOLA MARKETPLACE - ELASTICSEARCH SETUP
# ===========================================

echo "🚀 Setting up Elasticsearch for INBOLA Marketplace..."

# Check if Elasticsearch is running
if ! curl -s http://localhost:9200 > /dev/null; then
    echo "❌ Elasticsearch is not running. Please start Elasticsearch first."
    echo "You can start it with: docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0"
    exit 1
fi

echo "✅ Elasticsearch is running"

# Create products index with advanced mapping
curl -X PUT "http://localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "uzbek_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "uzbek_stemmer"]
        },
        "search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "uzbek_stemmer", "edge_ngram"]
        }
      },
      "filter": {
        "uzbek_stemmer": {
          "type": "stemmer",
          "language": "russian"
        },
        "edge_ngram": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "uzbek_analyzer",
        "search_analyzer": "search_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": { "type": "text", "analyzer": "uzbek_analyzer" },
      "price": { "type": "double" },
      "category": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" }
        }
      },
      "brand": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" }
        }
      },
      "is_in_stock": { "type": "boolean" },
      "is_featured": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}'

echo "✅ Products index created"

# Add some sample data
curl -X POST "http://localhost:9200/products/_doc/1" -H 'Content-Type: application/json' -d'
{
  "id": "1",
  "title": "Lego Classic Creative Bricks",
  "description": "Yosh bolalar uchun zamonaviy Lego to\'plami. 500+ qism.",
  "price": 150000,
  "category": { "id": "lego", "name": "Lego" },
  "brand": { "id": "lego", "name": "Lego" },
  "is_in_stock": true,
  "is_featured": true,
  "created_at": "2024-01-15",
  "title.suggest": "Lego Classic Creative Bricks"
}'

curl -X POST "http://localhost:9200/products/_doc/2" -H 'Content-Type: application/json' -d'
{
  "id": "2",
  "title": "Barbie Dreamhouse",
  "description": "Barbie uchun chiroyli uy. 3 qavatli, 70+ aksessuar.",
  "price": 850000,
  "category": { "id": "barbie", "name": "Barbie" },
  "brand": { "id": "mattel", "name": "Mattel" },
  "is_in_stock": true,
  "is_featured": false,
  "created_at": "2024-01-16",
  "title.suggest": "Barbie Dreamhouse"
}'

echo "✅ Sample data added"
echo "🎉 Elasticsearch setup complete!"
