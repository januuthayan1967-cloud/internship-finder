import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Admin from '../models/Admin.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    switch (decoded.userType) {
      case 'student':
        user = await Student.findById(decoded.userId).select('-password');
        break;
      case 'company':
        user = await Company.findById(decoded.userId).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.userId).select('-password');
        break;
      default:
        return res.status(401).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeStudent = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next();
};

export const authorizeCompany = (req, res, next) => {
  if (req.userType !== 'company') {
    return res.status(403).json({ message: 'Access denied. Companies only.' });
  }
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

export const authorizeApprovedCompany = async (req, res, next) => {
  if (req.userType !== 'company') {
    return res.status(403).json({ message: 'Access denied. Companies only.' });
  }
  
  if (!req.user.isApproved) {
    return res.status(403).json({ message: 'Company not approved yet.' });
  }
  
  next();
};