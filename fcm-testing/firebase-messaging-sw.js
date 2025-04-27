importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);
const firebaseConfig = {
  apiKey: "AIzaSyCiX0TCPzd5MhOh-th1sfW0Nd4VqU2dAN0",
  authDomain: "code-flee.firebaseapp.com",
  projectId: "code-flee",
  storageBucket: "code-flee.firebasestorage.app",
  messagingSenderId: "751980261836",
  appId: "1:751980261836:web:20ad32f3395510dae0ad69",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  const notificationTitle = payload.notification?.title || "New notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAtr1wNK_ya-Hf2JiRJ1hpRpSgG3W0YUj8mlSZgawgWSV_1opRRMFajFd4NoCeGKj-j8k&usqp=CAU",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
