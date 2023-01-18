import { generate } from "ezog/cloudflare"

export interface Env {} // KV and durable objects

const rFetch = async (url: string): Promise<ArrayBuffer> =>
    await fetch(url).then(async res => await res.arrayBuffer())

const baseUrl: string = "https://ideoxan.com/"

export default {
    async fetch(request: Response, env: Env, ctx: ExecutionContext): Promise<Response> {
        let url: URL = new URL(request.url)
        let cache: Cache = caches.default

        // Reject favicon requests
        if (url.pathname === "/favicon.ico") return new Response(null, { status: 404 })

        // Check if the request is already cached
        if (url.searchParams.get("force") != "true") {
            let cachedResponse: Response | undefined = await cache.match(url)
            if (cachedResponse) return cachedResponse
        } else await cache.delete(url)

        let logo: Promise<ArrayBuffer> = rFetch(`${baseUrl}images/ix_logo_white_trans_253x50.png`)
        let background: Promise<ArrayBuffer> = rFetch(`${baseUrl}images/og_bg.png`)

        const png: Uint8Array = await generate(
            [
                {
                    type: "image",
                    buffer: await background,
                    x: 0,
                    y: 0,
                    width: 800,
                    height: 400,
                },
                {
                    type: "image",
                    buffer: await logo,
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
        let response: Response = new Response(png, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "s-maxage=604800",
            },
        })

        // Cache the response
        await cache.put(url, response.clone())

        return response
    },
}
