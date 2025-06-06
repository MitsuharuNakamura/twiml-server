const express = require('express');
const axios = require('axios');
const { twiml } = require('twilio');
const debug = require('debug')('twiml:server'); // ← ログカテゴリ名を定義

const app = express();
const PORT = 5555;

// Twilioなどが送ってくる application/x-www-form-urlencoded なPOSTデータをパースして req.body に格納する
app.use(express.urlencoded({ extended: true }));

// 外部APIのリクエスト
async function checkExternalApi() {
  try {
    const req_url = 'https://google.co.jp/';
    const res = await axios.get(req_url);
    debug('API request succeeded');
    return { success: true, data: 'リクエストは成功しました。' };
  } catch (err) {
    debug('API request failed: %s', err.message);
    return { success: false, data: 'リクエストは失敗しました。' };
  }
}

// a call comes inで指定したURLの処理
app.post('/voice', async (req, res) => {
  // リクエストをDebug出力
  debug('--- Incoming Request ---');
  debug('Headers: %O', req.headers);
  debug('Body: %O', req.body);
  debug('Query: %O', req.query);
  debug('Params: %O', req.params);
  debug('URL: %s', req.url);
  debug('Method: %s', req.method);
  debug('------------------------');

  const response = new twiml.VoiceResponse();
  const launguage = 'ja-JP';
  const voice = 'Google.ja-JP-Chirp3-HD-Aoede';
  const pause_length = 5;

  response.say('こんにちは、これはテスト通話です。', { language: launguage, voice: voice });
  response.pause({ length: pause_length });

  const apiResult = await checkExternalApi();
  debug('API result: %O', apiResult);

  response.say(apiResult.data, { language: launguage, voice: voice });
  response.say('これで通話を終了します。', { language: launguage, voice: voice });
  response.hangup();

  res.type('text/xml');
  res.send(response.toString());
});

app.listen(PORT, () => {
  console.log(`TwiML server running at http://localhost:${PORT}/voice`);
});
