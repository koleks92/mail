document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function email_to_html(obj, arch) {
  const email = document.createElement('div');
          if (obj.read === true) {
            email.classList.add("read");
          }
          email.classList.add("email");

          // Create and append for each attribute
          const sender = document.createElement('div');
          sender.innerHTML = obj.sender;
          email.append(sender);

          const subject = document.createElement('div');
          subject.innerHTML = obj.subject;
          email.append(subject);

          const timestamp = document.createElement('div');
          timestamp.innerHTML = obj.timestamp;
          email.append(timestamp);

          if (arch === true) 
          {
            // Button for archive
          const archive = document.createElement('button');
          archive.classList.add("archive")
          archive.id=obj.id
          if (obj.archived === true)
          {
            archive.innerHTML = "Unarchive";
          }
          else
          {
            archive.innerHTML = "Archive";
          }

          // EventListener for button archive
          archive.addEventListener('click', function() {
            if (archive.textContent === "Archive")
            { // Set archived true
              fetch(`/emails/${obj.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              .then(location.reload());
            }
            else
            { // Set archived false
              fetch(`/emails/${obj.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
              .then(location.reload());
            }
            
          });
          email.append(archive);

          }
          
          // Send whole div to html
          document.querySelector("#emails").appendChild(email);
}

function compose_email() 
{
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


    // Select button and content
    const recipients = document.querySelector("#compose-recipients");
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');


    document.querySelector('form').onsubmit = () => {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients.value,
            subject: subject.value,
            body: body.value
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
      return false;
    }
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  // Clear emails to avoid double loading
  document.querySelector('#emails').innerHTML = '';

  let user_email = document.querySelector('#user_email').textContent;
  let arch = true;

  fetch(`/emails/${mailbox}`)
  // Put response into json form
  .then(response => response.json())
  .then(data => {
      console.log(data);
      // Log data to the console
      data.forEach(obj => {
        if (mailbox === 'inbox') 
        {
          if (obj.archived === false)
          {
            arch = true;
            email_to_html(obj, arch);
          }
        }
        else if (mailbox === 'archive') 
        {
          if (obj.archived === true) 
          {
            arch = true;
            email_to_html(obj, arch);
          }
        }
        if (mailbox === 'sent') 
        {
          if (obj.sender === user_email)
          {
            arch = false;
            email_to_html(obj);
          }
        }        
      });

  });
}


