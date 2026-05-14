import helmet from "helmet";
import cors from "cors";

// security layer
const securityMiddleware = [
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin"}
    }),
    cors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173"],
        methods:["GET", "POST", "PUT", "DELETE"],
        credentials: true

    })
];

export default securityMiddleware;