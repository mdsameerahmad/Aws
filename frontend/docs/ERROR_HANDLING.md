# Error Handling System Documentation

## Overview

This document outlines the error handling system implemented in the GrowthAffinity MLM application. The system provides a consistent approach to handling errors across the application, improving user experience and making debugging easier.

## Components

### 1. Error Pages

The application includes several dedicated error pages:

- **404 Page (`/pages/404.js`)**: Displayed when a page is not found
- **500 Page (`/pages/500.js`)**: Displayed when a server error occurs
- **Dashboard Error Page (`/pages/dashboard/error.js`)**: Contextual error page for dashboard-related errors
- **Admin Error Page (`/pages/admin/error.js`)**: Contextual error page for admin-related errors
- **Login Error Page (`/pages/login-error.js`)**: Handles authentication-related errors
- **Registration Error Page (`/pages/register-error.js`)**: Handles registration-related errors

### 2. Error Boundary Component

The `ErrorBoundary` component (`/components/ErrorBoundary.js`) is a React error boundary that catches JavaScript errors anywhere in the component tree and displays a fallback UI instead of crashing the application.

```jsx
// Usage in _app.js
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
```

### 3. Error Handler Utility

The error handler utility (`/utils/errorHandler.js`) provides functions for consistent error handling:

- `handleApiError`: Handles API errors with options for toast notifications and redirects
- `formatValidationErrors`: Formats validation errors from the API into a readable format
- `redirectToErrorPage`: Redirects to the appropriate error page based on the error status

```javascript
// Example usage in a component
import { useRouter } from 'next/router';
import { handleApiError } from '../utils/errorHandler';
import api from '../services/api';

const MyComponent = () => {
  const router = useRouter();
  
  const fetchData = async () => {
    try {
      const response = await api.get('/some-endpoint');
      // Handle success
    } catch (error) {
      handleApiError(error, router, { redirect: true });
    }
  };
  
  // ...
};
```

### 4. Enhanced API Service

The API service (`/services/api.js`) includes:

- Request interceptor for authentication
- Response interceptor for handling 401 unauthorized errors
- Enhanced methods with built-in error handling:
  - `getWithErrorHandling`
  - `postWithErrorHandling`
  - `putWithErrorHandling`
  - `deleteWithErrorHandling`

```javascript
// Example usage of enhanced API methods
import { useRouter } from 'next/router';
import api from '../services/api';

const MyComponent = () => {
  const router = useRouter();
  
  const fetchData = async () => {
    try {
      // This will automatically handle errors
      const response = await api.getWithErrorHandling('/some-endpoint', router);
      // Handle success
    } catch (error) {
      // Additional error handling if needed
    }
  };
  
  // ...
};
```

### 5. Middleware

The Next.js middleware (`/middleware.js`) handles routing and redirects for non-existent dynamic routes, ensuring users are directed to the appropriate error pages.

## Best Practices

1. **Use the Enhanced API Methods**: Prefer using the enhanced API methods (`getWithErrorHandling`, etc.) for automatic error handling.

2. **Implement Error Boundaries**: Use the `ErrorBoundary` component to catch and handle JavaScript errors in the component tree.

3. **Provide Helpful Error Messages**: When redirecting to error pages, include descriptive error messages to help users understand what went wrong.

4. **Handle Form Validation Errors**: Use the `formatValidationErrors` function to display form validation errors in a user-friendly format.

5. **Log Errors for Debugging**: Always log errors to the console or a logging service for debugging purposes.

## Error Flow

1. **API Error**: When an API error occurs, it is caught by the API service's response interceptor or the enhanced API methods.

2. **Error Processing**: The error is processed by the `handleApiError` function, which can show a toast notification and/or redirect to an error page.

3. **Error Display**: The appropriate error page is displayed with a helpful error message.

4. **Recovery Options**: Users are provided with options to recover from the error, such as retrying the operation or navigating to a different page.

## Conclusion

This error handling system provides a consistent and user-friendly approach to handling errors in the GrowthAffinity MLM application. By following the best practices outlined in this document, developers can ensure that errors are handled gracefully and users are provided with helpful information and recovery options.