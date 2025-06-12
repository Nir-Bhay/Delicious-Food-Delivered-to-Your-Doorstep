// // 1. User Signup
// POST / signup
// {
//     "name": "John Doe",
//         "email": "john@example.com",
//             "password": "password123"
// }

// // 2. User Login
// POST / auth / login
// {
//     "email": "john@example.com",
//         "password": "password123"
// }

// // 3. Admin Login
// POST / auth / login
// {
//     "email": "admin@gmail.com",
//         "password": "321"
// }

// // 4. Get User Profile
// GET / profile
// Headers: { "Authorization": "your_jwt_token" }

// // 5. Submit Payment
// POST / user / payment
// Headers: { "Authorization": "your_jwt_token" }
// {
//     "amount": 1000,
//         "transactionId": "TXN123456",
//             "upiId": "user@upi"
// }

// // 6. Admin Approve Payment
// PUT / admin / payment /: paymentId / approve
// Headers: { "Authorization": "admin_jwt_token" }

// // 7. Update Meal Status