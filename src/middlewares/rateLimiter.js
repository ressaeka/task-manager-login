import rateLimit from 'express-rate-limit'

// Limiter untuk login (5x dalam 15 menit)
export const loginLimiter = rateLimit ({
    windowMs : 15 * 60 * 1000,
    max : 5,
    message : {
        status: 'fail',
        message: 'Terlalu banyak percobaan login, Coba lagi setelah 15 menit.'
    },
    standardHeaders:true,
    legacyHeaders: false

});

// Limiter untuk register (5x dalam 1 jam)
export const registerLimiter = rateLimit ({
    windowMs : 60 * 60 * 1000,
    max : 5, 
    message : {
        status: 'fail',
        message: 'Terlalu banyak percobaan Register, Coba lagi setalah 1 jam.'
    },
    standardHeaders :true,
    legacyHeaders: false
})

// Limiter untuk api umum (100x dalam 1 menit)
export const apiLimiter = rateLimit({
    windowMs : 60 * 1000,
    max: 100,
    message: {
        status: 'fail',
        message: 'Terlalu banyak request, Coba lagi setalah 1 menit.'
    },
    standardHeaders :true,
    legacyHeaders: false
})

// limiter untuk api admin(200x dalam 1 menit)
export const adminLimiter  = rateLimit ({
    windowMs : 60 * 1000,
    max : 200,
    message : {
        status:'fail',
        message:'Terlalu banyak request, Coba lagi setelah 1 menit.'
    },
    standardHeaders: true,
    legacyHeaders: false

})

// // Limiter untuk super ketat
// export const strictLimiter = rateLimit ({
//     windowMs : 60 * 100,
//     max : 10,
//     message: {
//         status:'failed',
//         message:'Terlaly banyak request. Coba lagi setelah 1 menit.'
//     },
//     standardHeaders:true,
//     legancyHeaders:false
// })
