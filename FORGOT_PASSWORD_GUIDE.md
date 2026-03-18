# Forgot Password Implementation - Usage Guide

## Database Setup
Run this SQL command to add the reset_token column:
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
```

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Reset token generated",
  "resetToken": "abc123def456..."
}
```

### 2. Reset Password
**POST** `/api/auth/reset-password`

```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

## Flow Summary
1. User submits email to `/forgot-password`
2. System generates secure token and stores it in database
3. User receives token (in production, this would be emailed)
4. User submits token + new password to `/reset-password`
5. System validates token, hashes password, and updates user record
6. Reset token is automatically cleared for security

## Security Features
- ✅ Secure token generation using crypto.randomBytes(32)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Token validation before password reset
- ✅ Automatic token cleanup after successful reset
- ✅ Input validation (email required, password min 6 chars)
- ✅ Proper error handling for invalid tokens/users

## Error Responses
- `404` - User not found
- `400` - Invalid token or missing required fields
- `400` - Password too short (minimum 6 characters)

The implementation is now complete and ready for testing!
