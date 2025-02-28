# OpenAIVRMCharacterChat
<img width="1080px" src="https://github.com/MITSUHIRO-KURIKI/DjangoOpenAIVRMChat/blob/main/frontend/public/base/img_fps10.gif" />  

<sup>上記サンプルイメージでは、[フリー素材キャラクター「つくよみちゃん」](https://tyc.rei-yumesaki.net/ "フリー素材キャラクター「つくよみちゃん」") （© Rei Yumesaki）を使用しています。</sup>  
  

## What is this?
[OpenAI API](https://openai.com/blog/openai-api "OpenAI API")と音声認識に[Azure Speech Studio](https://azure.microsoft.com/ja-jp/products/ai-services/ai-speech "Azure Speech Studio")を利用したVRMとの会話アプリを学習として作成しました
  

## 設置
#### 1. `backend > .env` ファイルへの各種クラウドサービス情報の記載<br><sup>`backend > .env` file: Configure various cloud services</sup>  
###### AZURE_SPEECH_SERVICE の設定 (VRMでの音声会話に使用)<br><sup>Azure Speech Service settings (used for voice conversations in VRM)</sup>  
```
AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY='*** YOUR AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY ***'  
AZURE_SPEECH_SERVICES_REGION='*** YOUR AZURE_SPEECH_SERVICES_REGION ***'
```
  
###### OpenAI API KEYの設定 (GPT系統のモデル利用時に使用)<br><sup>OpenAI API KEY settings (used when utilizing GPT-based models)</sup>  
```
OPENAI_API_KEY='*** YOUR OPENAI_API_KEY ***'
```
  
#### 2. `frontend > public > services > vrmchat > vrm` へダウンロードした3Dモデル(`.vrm`)を格納します<br><sup>`frontend > public > services > vrmchat > vrm`: Place the downloaded 3D model (`.vrm`)</sup>  
<sup>3Dモデル(`.vrm`)はお好きなものをおいてください。モデルサイズ等に応じて、 `frontend > providers > VrmCoreProvider > VrmCoreProvider.tsx` のカメラ位置等を修正ください。<br><sup>You can place any 3D model you like. Depending on the model size, adjust the camera position, etc. in `frontend > providers > VrmCoreProvider > VrmCoreProvider.tsx`.</sup></sup>  
<sup>サンプルイメージに使用したのは[つくよみちゃん公式3Dモデル タイプA](https://tyc.rei-yumesaki.net/material/avatar/3d-a/ "つくよみちゃん公式3Dモデル タイプA")「①通常版（VRM）」です。<br><sup>The sample image used is the official ["Tsukuyomi-chan" 3D model Type A](https://tyc.rei-yumesaki.net/material/avatar/3d-a/ "Tsukuyomi-chan” 3D model Type A") "① Normal version (VRM).”</sup></sup>
  

## 実行 <sub><sup>`run`</sup></sub>  
> [!NOTE]
> DefaultAdminユーザー (以下でログインできます)<br><sup>DefaultAdmin user (you can log in with the following credentials)</sup>  
> <sup>Email: `admin★admin.com` (★→@)</sup>  
> <sup>Password: `defaultPwd123`</sup>  
```
$ docker-compose up -d --build
```  
-> :coffee:  
-> [http://localhost:3000/](http://localhost:3000/ "localhost:3000") 
  
* 開発時<br><sup>development</sup>  
```
$ docker-compose -f docker-compose.dev.yml up -d --build
```
  

## 主な実行環境
執筆前
  

## Other
本アプリケーションで使われる各種ライブラリのライセンスは改変したものを含めて本ライセンスには含まれません。各種ライブラリの原ライセンスに従って利用してください。<br><sup>Licenses for the various libraries used in the application are not included in the license. Please use them in accordance with the license of each library.</sup>  
  
  
## suppl.
執筆前