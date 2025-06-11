# twiml-server

## 概要

`twiml-server` は、Twilioなどのサービスからのリクエストに応答し、ダイヤルパッド入力を受け付けてNumbers APIから取得した数字トリビアを読み上げるサーバーです。Expressで構築されており、TwiML（Twilio Markup Language）を使って音声通話フローを制御します。

## 特徴

- Twilioなどの音声通話リクエストを受信し、TwiMLで応答
- Gather（ダイヤルパッド入力）による数字入力受付
- Numbers API（http://numbersapi.com）から取得したトリビアを音声で返答
- 日本語音声（Google Voice: Google.ja-JP-Chirp3-HD-Aoede）に対応
- デバッグログ（debug）でリクエストやAPIレスポンスを確認可能
- シンプルなExpress構成

## 使い方

### 1. インストール

```bash
git clone https://github.com/MitsuharuNakamura/twiml-server.git
cd twiml-server
npm install
```

### 2. 起動

```bash
npm start
# または（デバッグログ出力時）
npm run debug
```

デフォルトで http://localhost:5555/voice でサーバーが待ち受けます。
ngrokがあれば、ngrokを起動して、公開URLで受けれるよにしてください。

### 3. Twilioの設定

Twilioの「a call comes in」などのWebhook先として `http://<your-server>/voice` を指定してください。

## エンドポイント

- `POST /voice`  
  Twilio等からのリクエストを受け、  
  1. あいさつ  
  2. Pause  
  3. Gatherによる数字入力依頼  
  4. 入力がない場合のメッセージ  
  5. 通話終了メッセージ  

- `POST /voice-2ndflow`  
  Gatherで入力された数字（Digits）を受け取り、  
  1. 入力確認（「入力された値は○○です」）  
  2. Numbers API問い合わせ  
  3. API結果の読み上げ  
  4. 通話終了メッセージ  

## コアコード例

```javascript
// /voice
const response = new twiml.VoiceResponse();
response.say('こんにちは、これはテスト通話です。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.pause({ length: 5 });
const gather = response.gather({
  input: 'dtmf',
  numDigits: 2,
  timeout: 5,
  action: '/voice-2ndflow',
  method: 'POST'
});
gather.say('ダイヤルパッドで好きな数字を入力してください。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.say('入力が確認できませんでした。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.say('これで通話を終了します。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.hangup();
```

```javascript
// /voice-2ndflow
app.post('/voice-2ndflow', async (req, res) => {
  const response = new twiml.VoiceResponse();
  const digits = req.body.Digits;
  if (digits) {
    response.say(`入力された値は、${digits} です。`, { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
    const apiResult = await checkExternalApi(digits);
    response.say(apiResult.data, { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
  }
  response.say('これで通話を終了します。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
  response.hangup();
  res.type('text/xml');
  res.send(response.toString());
});
```

## 依存

- Node.js
- express
- axios
- twilio
- debug

## ライセンス

MIT