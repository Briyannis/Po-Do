const bcrypt = require('bcrypt');
const NoSQLClient = require('oracle-nosqldb').NoSQLClient

async function test() {
    let client;
    try {
        client = new NoSQLClient({
            region: "us-ashburn-1",
            auth: {
                iam: {
                    tenantId: "ocid1.tenancy.oc1..aaaaaaaaa7tepkwvwcbu5eij2cqjdnh5rvdd3wensz25cgqtjbfxlgbvbddq",
                    userId: "ocid1.user.oc1..aaaaaaaaqunwlxv4nj2gltly5ngdqvexryuxkmw7dvbkx5pxzx63rrrv4qrq",
                    fingerprint: "49:aa:d6:de:a8:9e:73:4c:54:2c:82:03:d9:d5:dd:e3",
                    privateKeyFile: "/Users/davidamaya/Downloads/amayadavid885@gmail.com_2024-03-15T23_58_08.486Z.pem"
                }
            }
        });
        // Perform a SELECT query to retrieve data from an existing table
        const res = await client.query('SELECT * FROM users');
        console.log('Query result:', res.rows); 

        const username = 'Cartman';
        const password = 'KennyPowers';
        const email = 'FlamaBlanca@email.com';

        const hashPass = await bcrypt.hash(password, 10);
        
        const insertRes = await client.put('users', {id:2, username: username, password: hashPass, email: email});
        console.log('Insert result:', insertRes.success);
        
        const deleteRes = result = await client.delete('users', {id:2});
        console.log('Delete result:', deleteRes.success);

        let prepStatement = await podoDB.prepare(
            'SELECT * FROM users WHERE username = ?');
        
        prepStatement.set(1, 'david');
        
        const user = await podoDB.query(prepStatement); 
        console.log('Test parameters:', user.rows[0].Password)

    } catch(err) {
        // Handle errors
        console.error('Error:', err);
    } finally {
        if (client) {
            client.close();
        }
    }
}
test();