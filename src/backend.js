//import English from "./locales/en.json"

import German from "./locales/de.json"

const languages = new Map()
languages.set("de", German)

exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'translate',
            handle: (ctx) => {
                const lang = ctx.request.getParameter('lang')
                ctx.response.json({translation: languages.get(lang)});
            }
        }
    ]
};
