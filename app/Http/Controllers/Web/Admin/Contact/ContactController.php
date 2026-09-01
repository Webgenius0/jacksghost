<?php

namespace App\Http\Controllers\Web\Admin\Contact;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of the contacts.
     */
    public function index(Request $request): Response
    {
        $contacts = Contact::search(['name', 'email', 'topic'])
            ->latest()
            ->paginateData();

        return Inertia::render('contact/index', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Display the specified contact.
     */
    public function show(Contact $contact): Response
    {
        return Inertia::render('contact/show', [
            'contact' => $contact,
        ]);
    }

    /**
     * Remove the specified contact from storage.
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect()->route('contact.index')->with('success', 'Contact deleted successfully!');
    }
}
