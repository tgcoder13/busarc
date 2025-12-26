import { getJson, setJson } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

export async function GET(req) {
    const users = await getJson("users.json") || [];
    return NextResponse.json(users);
}

export async function POST(req) {
    try {
        const { office, nickname } = await req.json();
        let users = await getJson("users.json") || [];

        // Validation
        if (users.find(u => u.nickname.toLowerCase() === nickname.toLowerCase())) {
            return NextResponse.json({ error: "Nickname already exists" }, { status: 400 });
        }

        const newUser = {
            id: Date.now().toString(),
            office,
            nickname,
            role: 'user', // Default Role
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await setJson("users.json", users);

        return NextResponse.json({ success: true, user: newUser });
    } catch (e) {
        return NextResponse.json({ error: "Failed to add user: " + e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, role } = await req.json();
        let users = await getJson("users.json") || [];

        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index].role = role;
            await setJson("users.json", users);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update role: " + e.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        let users = await getJson("users.json") || [];
        users = users.filter(u => u.id !== id);

        await setJson("users.json", users);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete user: " + e.message }, { status: 500 });
    }
}
