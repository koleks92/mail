document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');


});

function email_to_html(obj) {
  const email = document.createElement('div');
  email.id = "email";

  const from = document.createElement('div');
  from.innerHTML = `<b>From:</b> ${obj.sender}`;
  email.append(from);

  const to = document.createElement('div');
  to.innerHTML = `<b>To:</b> ${obj.recipients}`;
  email.append(to);

  const subject = document.createElement('div');
  subject.innerHTML = `<b>Subject:</b> ${obj.subject}`;
  email.append(subject);

  const timestamp = document.createElement('div');
  timestamp.innerHTML = `<b>Timestamp:</b> ${obj.timestamp}`;
  email.append(timestamp)

  const breaker_1 = document.createElement('hr');
  email.append(breaker_1);

  const body = document.createElement('div');
  body.innerHTML = obj.body;
  email.append(body);

  const breaker_2 = document.createElement('hr');
  email.append(breaker_2);

  // Get loggedin user email
  let user_email = document.querySelector('#user_email').textContent;
  if (obj.sender != user_email) 
  {
    const reply = document.createElement('button');
    reply.classList.add("reply", "btn", "btn-outline-dark");
    reply.innerHTML = "Reply";

    // Add event listener
    reply.addEventListener('click', function() 
    {
      reply_email(obj);
    })
    email.append(reply);

  }


  document.querySelector("#email").appendChild(email);

}

function mark_as_read(obj) {
  fetch(`/emails/${obj}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function emails_to_html(obj, arch, sent) {
  const email = document.createElement('div');
  if (obj.read === true) 
  {
    email.classList.add("read");
  }
  {
    email.classList.add("unread");
  }
  email.classList.add("emails_list");

  // Create and append for each attribute
  if (sent) 
  {
    const sender = document.createElement('div');
    sender.classList.add("emails_sender");
    sender.innerHTML = obj.recipients;
    email.append(sender);
  }
  else 
  {
    const sender = document.createElement('div');
    sender.classList.add("emails_sender");
    sender.innerHTML = obj.sender;
    email.append(sender);
  }


  const subject = document.createElement('div');
  subject.classList.add("emails_subject");
  subject.innerHTML = obj.subject;
  email.append(subject);

  if (arch === true) 
  {
    // Button for archive
    const archive = document.createElement('button');
    archive.classList.add("btn", "btn-sm", "btn-outline-dark", "emails_archive")
    archive.id = obj.id
    if (obj.archived === true)
    {
      archive.innerHTML = "Unarchive";
    }
    else
    {
      archive.innerHTML = "Archive";
    }

    // EventListener for button archive
    archive.addEventListener('click', function() 
    {
      if (archive.textContent === "Archive")
      { // Set archived true
        fetch(`/emails/${obj.id}`, 
        {
          method: 'PUT',
          body: JSON.stringify
          ({
              archived: true
          })
        })
      }
      else
      { // Set archived false
        fetch(`/emails/${obj.id}`,
        {
          method: 'PUT',
          body: JSON.stringify
          ({
              archived: false
          })
        })
      }
      
    });

    email.append(archive);
  }
  else 
  {
    const archive = document.createElement('div');
    archive.classList.add("emails_archive", "deactiv")
    email.append(archive);
  }

  const timestamp = document.createElement('div');
  timestamp.classList.add("emails_timestamp");
  timestamp.innerHTML = obj.timestamp;
  email.append(timestamp);

  email.addEventListener('click', event => {

    // Find what was clicked on
    const element = event.target;
    console.log(element.className);
    // Check if the user clicked on a hide button
    if (element.className == 'btn btn-sm btn-outline-dark emails_archive') {
        element.parentElement.style.animationPlayState = 'running';
        element.parentElement.addEventListener('animationend', () => {
          load_mailbox('inbox');
         });
    }
    else {
      load_email(obj.id)
    }
    
  });

  
  // Send whole div to html
  document.querySelector("#emails").appendChild(email);
}

function compose_email() 
{
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Show the compose name
  document.querySelector('#compose-title').innerHTML = "New email";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

    document.querySelector('form').onsubmit = () => 
    {
      // Select button and content
      const recipients = document.querySelector("#compose-recipients");
      const subject = document.querySelector('#compose-subject');
      const body = document.querySelector('#compose-body');
      // To keep formatting in email_view
      const encodedBody= body.value.replace(/\n/g, '<br>').replace(/\r/g, '<br>').replace(/\t/g, '&emsp');

      fetch('/emails', 
      {
        method: 'POST',
        body: JSON.stringify
        ({
            recipients: recipients.value,
            subject: subject.value,
            body: encodedBody
        })
      })
      .then(response => response.json())
      .then(result => 
      {
          // Print result
          console.log(result);
          // Delay to prevent from too early loading load_mailbox
          setTimeout(() => {
            load_mailbox('sent');
          }, 200);
      })
      return false;
    }
}

function reply_email(email) 
{

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Show the compose name
  document.querySelector('#compose-title').innerHTML = "Reply email";

  // Populate fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.startsWith("Re:"))
  {
    document.querySelector('#compose-subject').value = email.subject;
  }
  else
  {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  // To decode formatting
  const decodedBody = email.body.replace(/<br>/g, '\n').replace(/&emsp/g, '\t');
  document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: ${'\n'}"${decodedBody}"${'\n'}`;


    document.querySelector('form').onsubmit = () => 
    {
      // Select button and content
      const recipients = document.querySelector("#compose-recipients");
      const subject = document.querySelector('#compose-subject');
      const body = document.querySelector('#compose-body');
      // To keep formatting in email_view
      const encodedBody= body.value.replace(/\n/g, '<br>').replace(/\r/g, '<br>').replace(/\t/g, '&emsp');

      fetch('/emails', 
      {
        method: 'POST',
        body: JSON.stringify
        ({
            recipients: recipients.value,
            subject: subject.value,
            body: encodedBody
        })
      })
      .then(response => response.json())
      .then(result => 
      {
          // Print result
          console.log(result);
          // Delay to prevent from too early loading load_mailbox
          setTimeout(() => {
            load_mailbox('sent');
          }, 200);
      })
      return false;
    }
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  // Clear emails to avoid double loading
  document.querySelector('#emails').innerHTML = '';


  // Get loggedin user email
  let user_email = document.querySelector('#user_email').textContent;
  // Boolean for archvie button and sent
  let arch = true;
  let sent = true;

  fetch(`/emails/${mailbox}`)
  // Put response into json form
  .then(response => response.json())
  .then(data => {
      data.forEach(obj => {
        if (mailbox === 'inbox') 
        {
          if (obj.archived === false)
          {
            sent = false;
            emails_to_html(obj, arch, sent);
            document.querySelector("#eh_from").innerHTML = "From";

          }
        }
        else if (mailbox === 'archive') 
        {
          if (obj.archived === true) 
          {
            sent = false;
            emails_to_html(obj, arch, sent);
            document.querySelector("#eh_from").innerHTML = "From";
          }
        }
        if (mailbox === 'sent') 
        {
          if (obj.sender === user_email)
          {
            arch = false;
            emails_to_html(obj, arch, sent);
            document.querySelector("#eh_from").innerHTML = "To";
          }
        }        
      });

  });
}

function load_email(mail)
{

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Clear to avoid double loading
  document.querySelector('#email').innerHTML = '';


  fetch(`/emails/${mail}`)
  .then(response => response.json())
  .then(email => {
    // Mark as read
    mark_as_read(email.id);
    email_to_html(email);
  });
}


