# Add non-editable Employee ID to Personal Details

**Status:** ✅ Complete! Employee ID added to BOTH:
1. Employee PersonalDetails.jsx (dashboard)
2. Manager AllEmployees.jsx modal View details (top, monospace gray)



**Information Gathered:**
- PersonalDetails.jsx shows employee info but no ID
- `details._id` available from `/employees/me` API
- Add in view mode only (non-editable)

**Plan:**
1. **Frontend** ems-client/src/pages/employee/PersonalDetails.jsx:
   - Add `<p><strong>Employee ID:</strong> {details._id}</p>` in view mode (top)
   - Style consistently (non-editable, gray)

**Files:**
- ems-client/src/pages/employee/PersonalDetails.jsx

**Followup:**
- Test employee dashboard → Personal Details shows ID

Proceed?

