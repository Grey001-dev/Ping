import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from "../config/prisma.js"

export const handleauth = async (req, res) => {
    const { isSignUp, name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }
    try {
        if (isSignUp) {
            const userExist = await prisma.users.findUnique({
                where: { email }
            });
            if (userExist) {
                return res.status(400).json({ message: 'Email is already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await prisma.users.create({
                data: {
                    name: name || null,
                    email,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });

            const token = jwt.sign(
                { id: newUser.id },
                process.env.JWT_SECRET,
                { expiresIn: '14d' }
            );

            return res.status(201).json({ message: 'Account created successfully!', token, user: newUser });
        }
        else {
            const userExist = await prisma.users.findUnique({
                where: { email }
            });
            if (!userExist) {
                return res.status(400).json({ message: 'Email does not exist' });
            }

            const correctPassword = await bcrypt.compare(password, userExist.password);
            if (!correctPassword) {
                return res.status(400).json({ message: 'Invalid credentials.' });
            }

            const token = jwt.sign({ id: userExist.id }, process.env.JWT_SECRET, { expiresIn: '14d' });
            return res.status(200).json({
                message: 'Logged in successfully!',
                token,
                user: { id: userExist.id, name: userExist.name, email: userExist.email }
            });
        }
    } catch (err) {
        console.error('FULL AUTH ERROR:',err)
        res.status(500).json({ message: 'Authentication error. ', error: err.message });
    }
};