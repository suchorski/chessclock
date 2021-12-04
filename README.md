# Chess Clock

Made with [NativeScript-VUE](https://nativescript-vue.org/)

## Configuration

* Need to configure the Firebase to download the configuration file following [this](https://github.com/eddyverbruggen/nativescript-plugin-firebase#prerequisites);
* Need to configure the admob pub id `com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml` file on `Android App Resource` folder;
* Need to configure the admob pub id `GADApplicationIdentifier` in `Info.plist` file on `iOS App Resource` folder;
* Need to configure the following variables on `.env` file: (need to create on the root folder)
  * `ANDROID_ADMOB_REWARDED_VIDEO_ID`: Admob rewarded video id for Android;
  * `IOS_ADMOB_REWARDED_VIDEO_ID`: Admob rewarded video id for iOS;

## Running

### On android

Just run `ns debug android`

### On iOS

Just run `ns debug ios`

## Fixing issues

You can use `ns doctor` to check if everything is ok.