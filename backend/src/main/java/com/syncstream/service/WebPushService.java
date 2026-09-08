package com.syncstream.service;

import com.syncstream.model.PushSubscription;
import com.syncstream.repository.PushSubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.List;

@Service
@Slf4j
public class WebPushService {

    @Value("${vapid.public.key:}")
    private String publicKey;

    @Value("${vapid.private.key:}")
    private String privateKey;

    @Value("${vapid.subject:mailto:admin@syncstream.com}")
    private String subject;

    private PushService pushService;

    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    @PostConstruct
    public void init() throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());

        if (publicKey == null || publicKey.isEmpty() || privateKey == null || privateKey.isEmpty()) {
            log.warn("VAPID keys not configured in application.properties. Generating temporary keys for this session...");
            try {
                java.security.KeyPairGenerator keyPairGenerator = java.security.KeyPairGenerator.getInstance("ECDSA", "BC");
                keyPairGenerator.initialize(new java.security.spec.ECGenParameterSpec("prime256v1"));
                java.security.KeyPair keyPair = keyPairGenerator.generateKeyPair();
                
                publicKey = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(keyPair.getPublic().getEncoded());
                privateKey = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(keyPair.getPrivate().getEncoded());
                log.info("Generated VAPID Public Key: {}", publicKey);
                log.info("Generated VAPID Private Key: {}", privateKey);
            } catch (Exception e) {
                log.error("Failed to generate VAPID keys", e);
            }
        }

        pushService = new PushService();
        pushService.setPublicKey(publicKey);
        pushService.setPrivateKey(privateKey);
        pushService.setSubject(subject);
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void saveSubscription(String userId, String endpoint, String p256dh, String auth) {
        PushSubscription sub = PushSubscription.builder()
                .userId(userId)
                .endpoint(endpoint)
                .p256dh(p256dh)
                .auth(auth)
                .build();
        // Overwrite if endpoint exists
        pushSubscriptionRepository.deleteByEndpoint(endpoint);
        pushSubscriptionRepository.save(sub);
    }

    public void removeSubscription(String endpoint) {
        pushSubscriptionRepository.deleteByEndpoint(endpoint);
    }

    public void sendPushNotification(String userId, String payload) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(userId);
        if (subscriptions.isEmpty()) {
            return;
        }

        for (PushSubscription sub : subscriptions) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload.getBytes()
                );
                
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    try {
                        org.apache.http.HttpResponse response = pushService.send(notification);
                        int status = response.getStatusLine().getStatusCode();
                        if (status == 404 || status == 410) {
                            log.info("Push subscription expired or unsubscribed, removing endpoint: {}", sub.getEndpoint());
                            pushSubscriptionRepository.deleteByEndpoint(sub.getEndpoint());
                        }
                    } catch (Exception e) {
                        log.error("Failed to send push notification", e);
                    }
                });
            } catch (Exception e) {
                log.error("Error constructing push notification", e);
            }
        }
    }
}
