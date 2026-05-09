import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'driver' | 'admin' | 'laundromat_operator' | 'staff';
    aud?: string;
  };
  token?: string;
}

/**
 * Middleware to authenticate JWT token and attach user to request
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing authorization header' });
    }

    const token = authHeader.slice(7);
    req.token = token;

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ success: false, error: 'User profile not found' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile.role,
      aud: user.aud,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Optional auth - attach user if token present
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice(7);
    req.token = token;

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      if (profile) {
        req.user = {
          id: user.id,
          email: user.email || '',
          role: profile.role,
          aud: user.aud,
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}
