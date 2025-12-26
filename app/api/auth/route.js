import { getJson, setJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { action, user: netlifyUser, office, nickname } = body;

        // Hardcoded Override for provided credentials
        const cleanOffice = office?.toString().trim().toLowerCase();
        const cleanNickname = nickname?.toString().trim().toLowerCase();

        if (cleanOffice === '001' && cleanNickname === '1234') {
            return NextResponse.json({
                success: true,
                user: { id: 'admin-001', office: '001', nickname: '1234', role: 'admin' }
            });
        }

        // --- INIT DEFAULT ADMIN IF EMPTY ---
        let users = [];
        try {
            users = await getJson("users.json") || [];

            if (users.length === 0) {
                const defaultAdmin = [{
                    id: 'admin-001',
                    office: '001',
                    nickname: '1234',
                    role: 'admin',
                    email: 'admin@maverics.com',
                    createdAt: new Date().toISOString()
                }];
                await setJson("users.json", defaultAdmin);
                users = defaultAdmin;
            }
        } catch (storeError) {
            console.warn("Google Drive Store not available or error:", storeError.message);
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
                await setJson("users.json", users);
                return NextResponse.json({ success: true, user: newUser });
            }
        }

        // --- ACTION: CLASSIC LOGIN (Admin Override) ---
        const user = users.find(u =>
            u.office?.toLowerCase() === cleanOffice &&
            u.nickname?.toLowerCase() === cleanNickname
        );

        if (user) {
            return NextResponse.json({ success: true, user });
        } else {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }

    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Authentication failed: " + error.message }, { status: 500 });
    }
}
