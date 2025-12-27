import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
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

                    // Admin fallback
                    if (credentials.nickname === '001' && credentials.office === 'office') {
                        return { id: 'admin-001', nickname: '001', office: 'office', role: 'admin' };
                    }

                    // Standard user lookup
                    const user = users.find(u =>
                        u.nickname.toLowerCase() === credentials.nickname.toLowerCase() &&
                        u.office.toLowerCase() === credentials.office.toLowerCase()
                    );

                    if (user) {
                        return {
                            id: user.id,
                            nickname: user.nickname,
                            office: user.office,
                            role: user.role || 'user'
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    let users = await getJson("users.json") || [];
                    let existingUser = users.find(u => u.email === user.email);

                    if (!existingUser) {
                        const newUser = {
                            id: `google-${Date.now()}`,
                            email: user.email,
                            nickname: user.name || user.email.split('@')[0],
                            office: 'Google User',
                            role: 'user',
                            createdAt: new Date().toISOString()
                        };
                        users.push(newUser);
                        await setJson("users.json", users);
                        user.role = 'user';
                        user.nickname = newUser.nickname;
                        user.office = newUser.office;
                    } else {
                        user.role = existingUser.role || 'user';
                        user.nickname = existingUser.nickname;
                        user.office = existingUser.office;
                    }
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.office = user.office;
                token.nickname = user.nickname;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
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
