import {
  X,
  Copy,
  Trash2,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

export default function PartnerDrawer({

  open,

  partner,

  onClose,

  onCopy,

  onUnlink,

}) {

  if(!open || !partner) return null;

  return(

<div className="fixed inset-0 z-50 flex justify-end bg-black/30">

<div className="h-full w-full max-w-lg bg-white shadow-2xl">

<div className="flex items-center justify-between border-b p-6">

<h2 className="text-xl font-semibold">

Partner Relationship

</h2>

<button onClick={onClose}>

<X/>

</button>

</div>

<div className="space-y-6 p-6">

<div>

<p className="text-xs uppercase text-slate-400">

User

</p>

<p className="font-semibold">

{partner.full_name}

</p>

<p>

{partner.email}

</p>

</div>

<div>

<p className="text-xs uppercase text-slate-400">

Partner

</p>

<p className="font-semibold">

{partner.partner_name || "Not Linked"}

</p>

<p>

{partner.partner_email || "—"}

</p>

</div>

<div>

<p className="text-xs uppercase text-slate-400">

Relationship

</p>

<StatusBadge status={partner.status}/>

</div>

<div>

<p className="text-xs uppercase text-slate-400">

Invite Code

</p>

<p className="font-mono text-lg">

{partner.invite_code || "—"}

</p>

</div>

<div className="grid gap-3">

<button

onClick={()=>onCopy(partner)}

className="rounded-xl border border-slate-200 py-3 hover:bg-slate-50"

>

<Copy className="mr-2 inline h-4 w-4"/>

Copy Invite Code

</button>

{partner.partner_id && (

<button

onClick={()=>onUnlink(partner)}

className="rounded-xl border border-red-200 bg-red-50 py-3 text-red-700 hover:bg-red-100"

>

<Trash2 className="mr-2 inline h-4 w-4"/>

Remove Relationship

</button>

)}

</div>

</div>

</div>

</div>

);

}