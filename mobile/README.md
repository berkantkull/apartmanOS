# apartmanOS Mobil

apartmanOS'un Expo SDK 58 ve Expo Router ile geliştirilen Android/iOS uygulamasıdır. Expo Go ile geliştirme sırasında doğrudan telefonda çalıştırılabilir.

## Expo Go ile açma

Bilgisayar ve telefon aynı Wi-Fi ağına bağlıyken:

```bash
cd mobile
npm install
npm start
```

Terminalde oluşan QR kodu Android'de Expo Go içinden, iPhone'da kamera uygulamasından okutun.

## Yapılandırma

Uygulama varsayılan olarak `https://apartmanos.com.tr` API adresini kullanır. Farklı bir sunucu için:

```bash
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:5173"
npm start
```

Oturum anahtarı `expo-secure-store` ile cihazın güvenli alanında tutulur. Veritabanı bağlantı bilgileri mobil pakete eklenmez.

## Kontroller

```bash
npm run lint
npm run typecheck
npm run doctor
```
