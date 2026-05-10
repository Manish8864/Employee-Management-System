# TODO: Change Password in Personal Details

## Task: Add Change Password option in Personal Details section

### Current State:
- EmployeeDashboard.jsx has personal details inline with Change Password button
- PersonalDetails.jsx has Edit functionality but no Change Password option

### User Request:
- Personal Details in dashboard should open PersonalDetails.jsx page
- When clicking "Edit" in Personal Details, there should be option to "Change Password"

## Plan:

### 1. Modify EmployeeDashboard.jsx
- [ ] Replace inline personal details section with a button that navigates to `/employee/details`
- [ ] Remove inline change password functionality (will be in PersonalDetails.jsx)

### 2. Modify PersonalDetails.jsx
- [ ] Add change password state and form handling
- [ ] Add "Change Password" button in edit mode
- [ ] Show password change form when clicked
- [ ] Add API call to change password endpoint

### 3. No changes needed
- [ ] App.jsx - Route `/employee/details` already exists

## Implementation Steps:
1. Update EmployeeDashboard.jsx - add navigation to PersonalDetails page
2. Update PersonalDetails.jsx - add change password functionality in edit mode
3. Test the flow
