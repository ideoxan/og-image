import { generate } from "ezog/cloudflare"

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url)

        // Reject favicon requests
        if (url.pathname === "/favicon.ico") return new Response(null, { status: 404 })

        let logoArrayBuffer = fetch(
            "https://ideoxan.com/images/ix_logo_white_trans_253x50.png"
        ).then(async res => await res.arrayBuffer())
        let backgroundArrayBuffer = fetch("https://ideoxan.com/images/og_bg.png").then(
            async res => await res.arrayBuffer()
        )

        const png = await generate(
            [
                {
                    type: "image",
                    buffer: await backgroundArrayBuffer,
                    x: 0,
                    y: 0,
                    width: 800,
                    height: 400,
                },
                {
                    type: "image",
                    buffer: await logoArrayBuffer,
                    x: 64,
                    y: 140,
                    width: 76,
                    height: 15,
                },
                {
                    type: "textBox",
                    text: url.searchParams.get("lname") || "ideoxan.com",
                    x: 64,
                    y: 180,
                    width: 676,
                    fontFamily: ["Inter 800"],
                    fontSize: 32,
                    lineHeight: 34,
                    align: "left",
                    color: "#F8F5FF",
                },
                {
                    type: "textBox",
                    text: url.searchParams.get("desc") || "Sample description",
                    x: 64,
                    y: 230,
                    width: 676,
                    fontFamily: ["Inter 400"],
                    fontSize: 14,
                    lineHeight: 16,
                    align: "left",
                    color: "#c8c4d2",
                },
            ],
            {
                width: 800,
                height: 400,
                fonts: [
                    {
                        type: "googleFont",
                        name: "Inter 800",
                        googleFontName: "Inter",
                        weight: 800,
                    },
                    {
                        type: "googleFont",
                        name: "Inter 600",
                        googleFontName: "Inter",
                        weight: 600,
                    },
                    {
                        type: "googleFont",
                        name: "Inter 400",
                        googleFontName: "Inter",
                        weight: 400,
                    },
                ],
                background: "#fff",
            }
        )
        return new Response(png, {
            headers: {
                "Content-Type": "image/png",
            },
        })
    },
}
