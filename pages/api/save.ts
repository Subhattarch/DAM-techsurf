import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect'
import bodyParser from "body-parser";
import fs from "fs-extra"

export const config = {
    api: {
        bodyParser: false
    }
}

const getSavedData = async (link: string) => {
    try {
        return await fs.readJson(link) as Array<any>
    }
    catch {
        await fs.ensureFile(link)
        await fs.writeJson(link, [], {
            spaces: 4
        })
        return []
    }
}

const handler = nextConnect<NextApiRequest, NextApiResponse>()

handler.use(bodyParser.json({
    limit: "50gb"
}))
handler.use(bodyParser.urlencoded({
    extended: true,
    limit: "50gb"
}))

handler.post(async (req: NextApiRequest, res: NextApiResponse) =>  {
    const SavedData = await getSavedData("./private/json/saved.json")
    console.log(req.body)
    console.log("any")
    fs.writeJson("./private/json/saved.json", [...SavedData, req.body], {
        spaces: 4
    })
    res.send("saved")
})
handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
    const SavedData = await getSavedData("./private/json/saved.json")
    res.send(SavedData)
})

export default handler