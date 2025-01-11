```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.updateMultipleDocuments = functions.https.onCall(async (data, context) => {
  const batch = db.batch();
  const updates = [];

  //Example updates
  updates.push({ docRef: db.collection('users').doc('user1'), data: { points: 100 } });
  updates.push({ docRef: db.collection('users').doc('user2'), data: { points: 100 } }); // Could fail due to constraint
  updates.push({ docRef: db.collection('users').doc('user3'), data: { points: 100 } });

  const results = await Promise.allSettled(updates.map(async (update) => {
    try {
      batch.update(update.docRef, update.data);
      return { success: true, docId: update.docRef.id };
    } catch (error) {
      console.error(`Error updating document ${update.docRef.id}:`, error);
      return { success: false, docId: update.docRef.id, error };
    }
  }));

  const failedUpdates = results.filter((result) => !result.success);
  if (failedUpdates.length > 0) {
    return { success: false, failedUpdates };
  }
  await batch.commit();
  return { success: true };
});
```