import AuthService from "../services/authService.js";

class AuthController {
    static async register(req, res) {
        try {
            const userData = req.body;
            const user = await AuthService.registerUser(userData);
            const token = AuthService.generateToken(user);
            const userResponse = AuthService.formatUserResponse(user);

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: userResponse,
            });
        } catch (error) {
            if (error.message === "User already exists") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await AuthService.loginUser(email, password);
            const token = AuthService.generateToken(user);
            const userResponse = AuthService.formatUserResponse(user);

            res.json({
                message: "Login successful",
                token,
                user: userResponse,
            });
        } catch (error) {
            if (error.message === "Invalid credentials") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }
}

export default AuthController;
