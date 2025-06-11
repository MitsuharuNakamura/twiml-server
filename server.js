const express = require('express');
const axios = require('axios');
const { twiml } = require('twilio');
const debug = require('debug')('twiml:server'); // ← ログカテゴリ名を定義

const app = express();
const PORT = 5555;

// Twilioなどが送ってくる application/x-www-form-urlencoded なPOSTデータをパースして req.body に格納する
app.use(express.urlencoded({ extended: true }));

// 外部APIのリクエスト
async function checkExternalApi(digits) {
  try {
    const req_url = `http://numbersapi.com/${digits}`;
    const res = await axios.get(req_url);
    debug('API request succeeded');
    return { success: true, data: res.data};
  } catch (err) {
    debug('API request failed: %s', err.message);
    return { success: false, data: 'リクエストは失敗しました。' };
  }
}
///////////////////////////////////
// a call comes inで指定したURLの処理
//////////////////////////////////
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

  //Gather
  const gather = response.gather({
    input: 'dtmf',
    numDgits: 2,
    timeout:5,
    action: '/voice-2ndflow',
    method: 'POST'
  });
  gather.say('ダイヤルパッドで好きな数字を入力してください。', { language: launguage, voice: voice });

  //Timeoutの処理
  response.say('入力が確認できませんでした。', { language: launguage, voice: voice })
  //End Call
  response.say('これで通話を終了します。', { language: launguage, voice: voice });
  response.hangup();

  res.type('text/xml');
  res.send(response.toString());
});

///////////////////////////
// 最初のGather後のフロー
///////////////////////////
app.post('/voice-2ndflow', async (req, res) => {
  const response = new twiml.VoiceResponse();
  const launguage = 'ja-JP';
  const voice = 'Google.ja-JP-Chirp3-HD-Aoede';
  const digits = req.body.Digits;

  if(digits){
    response.say(`入力された値は、${digits} です。`, { language: launguage, voice: voice });
      // HTTP Request
    const apiResult = await checkExternalApi(digits);
    debug('API result: %O', apiResult);
    response.say(apiResult.data, { language: launguage, voice: voice });

  }
  //End Call
  response.say('これで通話を終了します。', { language: launguage, voice: voice });
  response.hangup();
  res.type('text/xml');
  res.send(response.toString());

});

///////////////////////////
// Listen
///////////////////////////
app.listen(PORT, () => {
  console.log(`TwiML server running at http://localhost:${PORT}/voice`);
});
