# Interview Cleanup System

## Overview

The interview cleanup system automatically removes interview entries when students don't join their scheduled interviews on time. This helps maintain data integrity and prevents stale interview records from cluttering the system.

## How It Works

### 1. Automatic Cleanup
- A cron job runs every 5 minutes to check for expired interviews
- Interviews are considered expired if:
  - The scheduled date has passed, OR
  - It's the scheduled date but the scheduled time has passed
- Only interviews with `status: 'scheduled'` and `joined: false` are moved to missed interviews
- Interviews that were joined by students are preserved
- Interview details are stored in `missedInterviews` array for reference

### 2. Manual Cleanup
- Admins can trigger manual cleanup via API endpoint: `POST /api/admin/cleanup-interviews`
- This is useful for testing or immediate cleanup needs

### 3. Interview Joining
- When students click "Join Now" on their dashboard, the system:
  1. Marks the interview as `joined: true`
  2. Records the join timestamp
  3. Navigates to the video room
- This prevents the interview from being automatically deleted

## Database Schema Changes

### Student Model
```javascript
interviews: [{
  // ... existing fields ...
  joined: {
    type: Boolean,
    default: false
  },
  joinedAt: Date,
  // ... other fields ...
}],
missedInterviews: [{
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: String,
  scheduledDate: Date,
  scheduledTime: String,
  round: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  roomId: String,
  reason: {
    type: String,
    enum: ['expired', 'no_show', 'cancelled'],
    default: 'expired'
  },
  missedAt: {
    type: Date,
    default: Date.now
  }
}]
```

### Company Model
```javascript
interviews: [{
  // ... existing fields ...
  joined: {
    type: Boolean,
    default: false
  },
  joinedAt: Date,
  // ... other fields ...
}]
```

## API Endpoints

### Mark Interview as Joined
```
PUT /api/students/interview/:id/join
```
- Marks an interview as joined by the student
- Required: Student authentication
- Updates both `joined` and `joinedAt` fields

### Get Missed Interviews
```
GET /api/students/missed-interviews
```
- Retrieves list of missed interviews for the student
- Required: Student authentication
- Returns interviews that were automatically cleaned up

### Manual Cleanup (Admin Only)
```
POST /api/admin/cleanup-interviews
```
- Triggers immediate cleanup of expired interviews
- Required: Admin authentication
- Returns count of deleted interviews

## Configuration

### Cron Schedule
- Default: Every 5 minutes (`*/5 * * * *`)
- Can be modified in `utils/interviewCleanup.js`

### Logging
- All cleanup operations are logged to console
- Includes timestamps and counts of deleted interviews
- Error handling with detailed error messages

## Testing

### Test Expired Interview Cleanup
1. Create a test interview with a past date/time
2. Ensure `joined: false`
3. Wait for cron job to run or trigger manual cleanup
4. Verify interview is removed from both student and company records

### Test Joined Interview Preservation
1. Create a test interview with a past date/time
2. Mark as `joined: true` via API
3. Run cleanup
4. Verify interview is preserved

## Monitoring

### Console Logs
- `🕐 Running interview cleanup at [timestamp]`
- `🗑️ Removing expired interview for student [id]: [company] at [date] [time]`
- `✅ Interview cleanup completed. Removed [count] expired interviews.`
- `❌ Error during interview cleanup: [error]`

### Dashboard Behavior
- Student dashboard filters out expired interviews that weren't joined
- Shows only valid upcoming interviews or joined past interviews
- Displays missed interviews in a separate section with red styling
- Shows missed interview count in stats cards
- Real-time updates when interviews are cleaned up

## Security Considerations

- Only admins can trigger manual cleanup
- Students can only mark their own interviews as joined
- All operations are logged for audit purposes
- No sensitive data is exposed in cleanup logs

## Troubleshooting

### Common Issues

1. **Interviews not being cleaned up**
   - Check if cron job is running
   - Verify interview dates/times are correct
   - Ensure `joined` field is `false`

2. **Joined interviews being deleted**
   - Verify `joined` field is being set correctly
   - Check API call to `/api/students/interview/:id/join`

3. **Cron job not running**
   - Check server logs for initialization messages
   - Verify `node-cron` dependency is installed
   - Restart server to reinitialize cron jobs

### Debug Commands

```javascript
// Check current interviews
GET /api/students/interviews

// Check missed interviews
GET /api/students/missed-interviews

// Manual cleanup
POST /api/admin/cleanup-interviews

// Mark interview as joined
PUT /api/students/interview/:id/join
``` 