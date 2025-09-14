import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for on-demand ISR revalidation
 * Allows manual cache invalidation for specific pages
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  const secret = req.query.secret || req.body?.secret;
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const { path, paths } = req.body;
    
    if (paths && Array.isArray(paths)) {
      // Revalidate multiple paths
      const results = await Promise.allSettled(
        paths.map(async (p: string) => {
          await res.revalidate(p);
          return p;
        })
      );
      
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);
        
      const failed = results
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          path: paths[index],
          error: (result as PromiseRejectedResult).reason
        }));
      
      return res.json({
        revalidated: true,
        successful,
        failed,
        timestamp: new Date().toISOString()
      });
    } else if (path) {
      // Revalidate single path
      await res.revalidate(path);
      
      return res.json({ 
        revalidated: true, 
        path,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({ 
        message: 'Path or paths parameter is required' 
      });
    }
  } catch (err) {
    console.error('Revalidation error:', err);
    
    return res.status(500).json({ 
      message: 'Error revalidating',
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}