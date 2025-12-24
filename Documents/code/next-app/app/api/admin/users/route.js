import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function GET(req) {
    const userStore = getStore("users");
    const users = await userStore.get("list", { type: "json" }) || [];
    return NextResponse.json(users);
}

export async function POST(req) {
    try {
        const { office, nickname } = await req.json();
        const userStore = getStore("users");

        let users = await userStore.get("list", { type: "json" }) || [];

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
        await userStore.setJSON("list", users);

        return NextResponse.json({ success: true, user: newUser });
    } catch (e) {
        return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, role } = await req.json();
        const userStore = getStore("users");
        let users = await userStore.get("list", { type: "json" }) || [];

        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index].role = role;
            await userStore.setJSON("list", users);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        const userStore = getStore("users");

        let users = await userStore.get("list", { type: "json" }) || [];
        users = users.filter(u => u.id !== id);

        await userStore.setJSON("list", users);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
