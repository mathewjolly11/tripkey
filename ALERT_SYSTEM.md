# TripKey Alert System

## Overview

The TripKey alert system uses **SweetAlert2** with a custom theme matching the application's design (sky blue colors).

## Usage Examples

### 1. Success Alert
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Simple success
await tripKeyAlert.success('Success!', 'Your booking has been created.');
```

### 2. Error Alert
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Show error
await tripKeyAlert.error('Error', 'Something went wrong. Please try again.');
```

### 3. Warning Alert
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Show warning
await tripKeyAlert.warning('Warning', 'This action cannot be undone.');
```

### 4. Confirmation Dialog
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Ask for confirmation
const result = await tripKeyAlert.confirm(
  'Delete Booking?',
  'Are you sure you want to delete this booking? This action cannot be undone.'
);

if (result.isConfirmed) {
  // Proceed with deletion
}
```

### 5. Sign Out Confirmation
```tsx
import { tripKeyAlert } from '@/lib/alerts';

const handleSignOut = async () => {
  const result = await tripKeyAlert.signOutConfirm();

  if (result.isConfirmed) {
    await signOut();
    router.push('/');
    await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
  }
};
```

### 6. Info Alert
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Show information
await tripKeyAlert.info('Welcome', 'Welcome to TripKey!');
```

### 7. Loading Alert
```tsx
import { tripKeyAlert } from '@/lib/alerts';

// Show loading state
tripKeyAlert.loading('Processing your request...');

// ... do something
// Then close it
tripKeyAlert.close();
```

## Theme Colors

The alerts are styled with TripKey brand colors:

- **Primary**: Sky-500 (#0ea5e9) - For success and info
- **Danger**: Red-500 (#ef4444) - For errors and destructive actions
- **Warning**: Amber-500 (#f59e0b) - For warnings
- **Background**: Sky-50 (#f0f9ff) - Light background
- **Text**: Gray-900 (#111827) - Dark text

## Locations Using Alerts

All these pages now use SweetAlert for signout confirmation:

✅ Dashboard (Tourist)
✅ Add Booking
✅ My Bookings
✅ My QR Code
✅ Provider Dashboard
✅ Provider Scan
✅ Provider History
✅ Admin Dashboard
✅ Navigation Bar (Global)

## Implementation Details

The alert system is defined in `/lib/alerts.ts` and exports the `tripKeyAlert` object with these methods:

```typescript
tripKeyAlert.success(title, message?)
tripKeyAlert.error(title, message?)
tripKeyAlert.warning(title, message?)
tripKeyAlert.confirm(title, message)
tripKeyAlert.signOutConfirm()
tripKeyAlert.info(title, message?)
tripKeyAlert.loading(message)
tripKeyAlert.close()
```

All alerts:
- Use the TripKey theme colors
- Have consistent styling across the app
- Prevent actions outside the dialog
- Match the application's design language
