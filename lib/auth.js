import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { getJson, setJson } from "@/lib/storage";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                nickname: { label: "Nickname", type: "text" },
                office: { label: "Office", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.nickname || !credentials?.office) {
                    return null;
                }

                try {
                    let users = await getJson("users.json") || [];

                    // Find user by nickname and office (primary login)
                    let user = users.find(u =>
                        u.nickname === credentials.nickname &&
                        u.office === credentials.office
                    );

                    if (!user) {
                        // New user registration via credentials
                        user = {
                            id: `user-${Date.now()}`,
                            email: `${credentials.nickname.toLowerCase()}@maverics.internal`,
                            nickname: credentials.nickname,
                            office: credentials.office,
                            role: (credentials.nickname === '001' && credentials.office === 'office') ? 'admin' : 'user', // Default admin check if needed
                            createdAt: new Date().toISOString(),
                        };
                        users.push(user);
                        await setJson("users.json", users);
                    }

                    return user;
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    let users = await getJson("users.json") || [];
                    let existingUser = users.find(u => u.email === user.email);

                    if (!existingUser) {
                        existingUser = {
                            id: user.id || `google-${Date.now()}`,
                            email: user.email,
                            nickname: user.name || user.email.split('@')[0],
                            office: 'Member',
                            role: 'user',
                            createdAt: new Date().toISOString(),
                        };
                        users.push(existingUser);
                        await setJson("users.json", users);
                    }

                    // Attach properties to user object for JWT callback
                    user.role = existingUser.role;
                    user.office = existingUser.office;
                    user.nickname = existingUser.nickname;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.office = user.office;
                token.nickname = user.nickname;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.office = token.office;
                session.user.nickname = token.nickname;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.AUTH_SECRET,
});
