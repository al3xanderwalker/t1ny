import * as express from 'express';
import * as path from 'path';
import {Database} from 'simple-sqlite3';
const app = express.default();

const newId = async (): Promise<string> => {
  for (var i = 0; i < 100; i++) {
    var newId = generateId();
    var db = await new Database('Links').safe();
    var exists = await db.get(newId);
    if (!exists) return newId;
  }
  return 'error';
};
const generateId = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'.split(
    ''
  );
  var id = '';
  for (var i = 0; i < 3; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

app
  .use(express.static(__dirname + '/public'))
  .set('views', path.join(__dirname, '/views'))
  .set('view engine', 'ejs')
  .use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.render('index');
});
app.post('/shortUrls', async (req, res) => {
  var id = await newId();
  if (id == 'error') return res.send('An Error Occurred');

  var db = await new Database('Links').safe();
  await db.set(id, req.body.fullUrl);
  res.redirect(`/new/${id}`);
});
app.get('/:shortUrl', async (req, res) => {
  var db = await new Database('Links').safe();
  var fullUrl = await db.get(req.params.shortUrl);
  if (!fullUrl) return res.redirect('/');
  res.redirect(fullUrl);
});

app.get('/new/:shortUrl', (req, res) => {
  res.render('new', {code: req.params.shortUrl});
});

app.listen(8088, async () => {
  var db = await new Database('Links').safe();
  await db.ensureTable();
  console.log(`Listening on 8088`);
});
