import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { action, user: netlifyUser, office, nickname } = body;
        // action: 'sync' | 'login'

        const userStore = getStore("users");
        let users = await userStore.get("list", { type: "json" }) || [];

        // --- INIT DEFAULT ADMIN IF EMPTY ---
        if (users.length === 0) {
            const defaultAdmin = [{
                id: 'admin-001', office: 'Antigravity', nickname: 'admin', role: 'admin', email: 'admin@maverics.com', createdAt: new Date().toISOString()
            }];
            await userStore.setJSON("list", defaultAdmin);
            users = defaultAdmin;
        }

        // --- ACTION: SYNC (Netlify Identity Login) ---
        if (action === 'sync' && netlifyUser) {
            const existingUser = users.find(u => u.email === netlifyUser.email);

            if (existingUser) {
                return NextResponse.json({ success: true, user: existingUser });
            } else {
                // New User Registration
                const newUser = {
                    id: netlifyUser.id,
                    office: 'Member',
                    nickname: netlifyUser.user_metadata?.full_name || netlifyUser.email.split('@')[0],
                    email: netlifyUser.email,
                    role: 'user', // Default
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);
                await userStore.setJSON("list", users);
                return NextResponse.json({ success: true, user: newUser });
            }
        }

        // --- ACTION: CLASSIC LOGIN (Admin Override) ---
        const user = users.find(u =>
            u.office?.toLowerCase() === office?.trim().toLowerCase() &&
            u.nickname?.toLowerCase() === nickname?.trim().toLowerCase()
        );

        if (user) {
            return NextResponse.json({ success: true, user });
        } else {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }

    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
