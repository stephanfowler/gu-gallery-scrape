var request = require('request'),
    express = require('express'),
    cheerio = require('cheerio'),
    hogan = require("hogan.js"),

    app = express(),
    template = hogan.compile('<img src="{{src}}" alt="{{alt}}" style="height:95px; width:158px; margin: 0 5px 5px 0; " />');

app.get(/^\/(.+)/, function(req, res) {
    var capid = req.params[0];

    request(
        {
          url: 'http://someapi/' + capid + '?show-fields=body'
        },
        function(err, response, body) {
            try {
                body = JSON.parse(body);
                body = body.response.content.fields.body;
            } catch (e) {
                body = false;
            };

            if (body) {
                var $ = cheerio.load(body),
                    imgs = [];

                $('img').each(function(i, data) {
                    data = $(data);
                    imgs.push({
                        src:    data.attr('src'),
                        alt:    data.attr('alt'),
                        width:  data.attr('width'),
                        height: data.attr('height')
                    });
                })

                res.setHeader('content-type', 'text/html');
                res.end(
                    imgs
                    .map(function(img) {
                        return template.render(img);
                    })
                    .join('')
                );
            } else {
                res.end('Not a valid peice of content?');
            }
        }
    );
})

app.listen('8080')

