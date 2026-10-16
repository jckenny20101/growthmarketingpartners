"""Check that the website forms still send the designed HTML emails, and restore them if not.

Elementor can strip the HTML out of a form's email message (the Elementor MCP `manage-elements` tool does,
and the booking form lost its formatting once without a visible revision). The emails then arrive as one
block of text. This compares what each form stores with the templates in email-templates/.

Usage (credentials come from the environment, never from this repo):
    WP_USER=ckenny WP_APP_PASSWORD='xxxx xxxx ...' python3 build/check_email_templates.py           # check
    WP_USER=ckenny WP_APP_PASSWORD='xxxx xxxx ...' python3 build/check_email_templates.py --restore # fix
"""
import base64, json, os, sys, urllib.request
from pathlib import Path

SITE = 'https://www.growthmarketingpartners.ca/wp-json'
T = Path(__file__).resolve().parent.parent / 'email-templates'
# page id -> form id -> {action: template file}
FORMS = {
    115: {'20d1f704': {'email': 'book-a-diagnostic-notification.min.html', 'email_2': 'book-a-diagnostic-confirmation.min.html'}},
    284: {'5bffcb2a': {'email': 'tools-lead.min.html', 'email_2': 'tools-results.min.html'},
          '8258be06': {'email': 'tools-lead.min.html', 'email_2': 'tools-results.min.html'}},
}

def call(method, path, body=None):
    auth = base64.b64encode(f"{os.environ['WP_USER']}:{os.environ['WP_APP_PASSWORD']}".encode()).decode()
    req = urllib.request.Request(SITE + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def forms(nodes, out):
    for e in nodes:
        if e.get('elType') == 'e-form':
            out[e['id']] = e
        forms(e.get('elements', []), out)
    return out

def main(restore):
    ok = True
    for page, spec in FORMS.items():
        data = json.loads(call('GET', f'/wp/v2/pages/{page}?context=edit&_fields=meta')['meta']['_elementor_data'])
        found, changed = forms(data, {}), False
        for fid, actions in spec.items():
            for action, name in actions.items():
                want = (T / name).read_text()
                msg = found[fid]['settings'][action]['value']['message']
                good = msg.get('value') == want
                print(f"page {page} form {fid} {action}: {'OK' if good else 'DIFFERENT'} ({len(msg.get('value', ''))} vs {len(want)} chars)")
                if not good:
                    ok = False
                    if restore:
                        found[fid]['settings'][action]['value']['message'] = {'$$type': 'string', 'value': want}
                        changed = True
        if changed:
            call('POST', f'/wp/v2/pages/{page}', {'meta': {'_elementor_data': json.dumps(data, separators=(',', ':'))}})
            print(f'page {page}: restored')
    return ok

if __name__ == '__main__':
    sys.exit(0 if main('--restore' in sys.argv) else 1)
