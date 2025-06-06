# twiml-server

## 概要

`twiml-server` は、Twilioなどのサービスからのリクエストに応答し、日本語の音声案内や外部API連携を行うためのサーバーです。Expressで構築されており、TwiML（Twilio Markup Language）を使って音声通話フローを制御します。

## 特徴

- Twilioなどの音声通話リクエストを受信し、TwiMLで応答
- 日本語音声（Google Voice: Google.ja-JP-Chirp3-HD-Aoede）に対応
- 外部API（例：Google）へのアクセス結果を音声で返答
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
node server.js
# または
npm start
```

デフォルトで http://localhost:5555/voice でサーバーが待ち受けます。
ngrokがあれば、ngrokを起動して、公開URLで受けれるよにしてください。

### 3. Twilioの設定

Twilioの「a call comes in」などのWebhook先として `http://<your-server>/voice` を指定してください。

## エンドポイント

- `POST /voice`  
  Twilio等からのリクエストを受け、  
  1. あいさつ（日本語）
  2. 外部APIチェック結果の読み上げ
  3. 5秒間無音で一時停止
  4. 終了メッセージ  
  を日本語音声で返します。

## コアコード例

```javascript
const response = new twiml.VoiceResponse();
response.say('こんにちは、これはテスト通話です。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.pause({ length: 5 });
// 外部API呼び出し結果を読み上げ
response.say(apiResult.data, { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.say('これで通話を終了します。', { language: 'ja-JP', voice: 'Google.ja-JP-Chirp3-HD-Aoede' });
response.hangup();
```

## 依存

- Node.js
- express
- axios
- twilio
- debug

## ライセンス

MIT