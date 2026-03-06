const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function deployRules() {
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    const projectId = serviceAccount.project_id;

    const tokenObj = await admin.app().options.credential.getAccessToken();
    const token = tokenObj.access_token;

    // Create ruleset
    const urlCreate = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;
    let res = await fetch(urlCreate, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            source: {
                files: [{ name: "firestore.rules", content: rules }]
            }
        })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const rulesetName = data.name;

    // Release to Firestore
    const releaseName = `projects/${projectId}/releases/cloud.firestore`;
    const urlRelease = `https://firebaserules.googleapis.com/v1/${releaseName}`;
    res = await fetch(urlRelease, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: releaseName,
            rulesetName: rulesetName
        })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('Firestore Database Security Rules deployed successfully!');
    process.exit(0);
}
deployRules().catch(err => { console.error('Error:', err); process.exit(1); });
