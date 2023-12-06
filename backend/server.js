const express = require("express");
const axios = require('axios');
const cors = require('cors')
const { response } = require("express");
const path = require('path');
const app = express();
app.use(cors());
const port = 8080;
app.use(express.static(__dirname + '/dist'));
const config = {
    headers: {
        Authorization: ''
    }
};

function api_request(url) {

}

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.get('/search', (req, res) => {

    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.get('/bookings', (req, res) => {

    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));

app.get("/businesses/:term/:latitude/:longitude/:categories/:radius", (req, res) => {
    // http://127.0.0.1:3000/businesses/pizza/34.05/-118.56/food/5000
    console.log(req.params.term, req.params.latitude, req.params.longitude, req.params.categories, req.params.radius);
    url = `https://api.yelp.com/v3/businesses/search?term=${req.params.term}&latitude=${req.params.latitude}&longitude=${req.params.longitude}&categories=${req.params.categories}&radius=${req.params.radius}&limit=10`
    const businesses = []
    axios
        .get(url,
            config
        ).then((response) => {

            response = response.data.businesses
            for (let b in response) {
                business = {}
                business['no'] = Number(b) + 1
                business['id'] = response[b].id
                business['image'] = response[b].image_url
                business['name'] = response[b].name
                business['rating'] = response[b].rating
                business['distance'] = Math.round(response[b].distance / 1609)
                businesses.push(business)
            }
            res.send(businesses);
        })
        .catch(() => {
            res.send(businesses);
        });
});

app.get("/coordinates/:location", (req, res) => {
    // http://127.0.0.1:3000/businesses/pizza/34.05/-118.56/food/5000
    console.log(req.params.location);
    url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.params.location}&key=AIzaSyCAgOoi2z4NExsSVqJIVrUnsBfIWF_WmKg`;
    const coordinates = []
    axios
        .get(url,
            config
        ).then((response) => {

            response = response.data.results[0].geometry.location
            console.log(response)

            for (let b in response) {
                coordinates.push(response[b])
            }
            res.send(coordinates);
        })
        .catch(() => {
            res.send(coordinates);
        });
});


app.get("/business/:id", (req, res) => {
    // http://127.0.0.1:3000/business/FfNg-hqpH5_lDZmhNUfYNA
    console.log(req.params.id)
    url = `https://api.yelp.com/v3/businesses/${req.params.id}`
    const keys = ['categories', 'coordinates', 'display_phone', 'hours', 'location', 'id', 'name', 'photos', 'price', 'url']
    const business = {}
    axios
        .get(url,
            config
        ).then((response) => {
            response = response.data
            for (let r in response) {
                if (r == 'categories') {
                    var category = ''
                    for (let c in response[r]) {
                        category = category + response[r][c].title + ' | '
                    }
                    category = category.slice(0, -3)
                    business['category'] = category
                }

                if (r == 'coordinates') {
                    business['coordinates'] = response[r]
                }

                if (r == 'display_phone') {
                    business['phone'] = response[r]
                }

                if (r == 'hours') {
                    business['is_open_now'] = response[r][0].is_open_now
                }

                if (r == 'location') {
                    business['location'] = ''
                    for (let l in response[r].display_address) {
                        business['location'] = business['location'] + ' ' + response[r].display_address[l]
                    }
                }

                if (r == 'id') {
                    business['id'] = response[r]
                }

                if (r == 'name') {
                    business['name'] = response[r]
                }

                if (r == 'photos') {
                    business['photos'] = response[r]
                }

                if (r == 'price') {
                    business['price'] = response[r]
                }

                if (r == 'url') {
                    business['url'] = response[r]
                }


            }
            res.send(business);

        })
        .catch();
});

app.get("/keyword/:text", (req, res) => {
    // http://127.0.0.1:3000/keyword/pizza
    console.log(req.params.text)
    url = `https://api.yelp.com/v3/autocomplete?text=${req.params.text}`
    const autocomplete = []
    axios
        .get(url,
            config
        ).then((response) => {
            response = response.data
            for (let r in response) {
                for (let l in response[r]) {
                    if (r == 'categories') {
                        autocomplete.push(response[r][l].title)
                    } else if (r == 'terms') {
                        autocomplete.push(response[r][l].text)
                    }
                }
            }
            res.send(autocomplete);

        })
        .catch(() => {
            console.log;
            res.send(autocomplete);
        });
});

app.get("/reviews/:id", (req, res) => {
    // http://127.0.0.1:3000/reviews/FfNg-hqpH5_lDZmhNUfYNA
    console.log(req.params.id)
    url = `https://api.yelp.com/v3/businesses/${req.params.id}/reviews`
    const reviews = []
    axios
        .get(url,
            config
        ).then((response) => {
            response = response.data.reviews
            for (let r in response) {
                review = {}
                review['rating'] = response[r].rating
                review['text'] = response[r].text
                review['time_created'] = response[r].time_created.split(" ")[0]
                review['user_name'] = response[r].user.name
                reviews.push(review)
            }
            res.send(reviews);

        })
        .catch(console.log);
});

app.listen(port, () => {
    console.log(`The backend is listening on port ${port}!`);
});
