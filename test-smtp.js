const nodemailer = require('nodemailer');

const config = {
	host: 'mail.newtontide.com',
	port: 587,
	secure: true,
	auth: {
		user: 'app@proxcord.cc',
		pass: 'pRoyAd,&,89#,71,ofISeRpRoyAd,&,89#,71,ofISeRpRoyAd,&,89#,71,ofISeRpRoyAd,&,89#,71,ofISeR',
	},
	tls: {
		rejectUnauthorized: false,
	},
};

async function testSmtp() {
	console.log('Testing SMTP connection to mail.newtontide.com:587...');
	
	const transporter = nodemailer.createTransport(config);
	
	try {
		// Verify connection
		console.log('Verifying connection...');
		await transporter.verify();
		console.log('✓ SMTP connection successful!');
		
		// Send test email
		console.log('Sending test email...');
		const info = await transporter.sendMail({
			from: 'Proxcord <app@proxcord.cc>',
			to: 'app@proxcord.cc',
			subject: 'SMTP Test - Proxcord',
			text: 'This is a test email from Proxcord SMTP configuration.\n\nIf you receive this, SMTP is working correctly.',
		});
		
		console.log('✓ Test email sent successfully!');
		console.log('Message ID:', info.messageId);
		
	} catch (error) {
		console.error('✗ SMTP test failed:');
		console.error(error);
		process.exit(1);
	}
}

testSmtp();
