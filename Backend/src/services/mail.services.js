import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_Client_ID,
    clientSecret: process.env.GOOGLE_Client_Secret,
    refreshToken: process.env.GOOGLE_Refresh_Token,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export async function sendMail({to,subject,html,text}) {
    const mailoption = {
        from : process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    }
    
    const details = await transporter.sendMail(mailoption)
    console.log("Email Sent : ",details);
    
}