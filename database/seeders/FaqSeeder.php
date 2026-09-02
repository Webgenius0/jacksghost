<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'type' => 'general',
                'question' => 'When will I receive my sport agent directory?',
                'answer' => 'When you join our online directory, you receive Instant Access to our secure web site. You will be provided with a secure login that is automatically activated by our system allowing you to immediately login and begin using our complete directory. Our professional sports agent directory is provided online and is not sent to our clients via postal mail.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'What file format is your directory sent to me in?',
                'answer' => 'Our professional sports agent directory is provided online only, we do not distribute it in any printed or file format.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How often do you update your sports agent directory?',
                'answer' => 'We update our sports agent directory 365 days per year. We have routine scheduled updates for specific sports and we update individual listings any time new or updated information becomes available.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How do I find available sports agent internships?',
                'answer' => 'If you are a college student interested in working in the sports agent industry, you can search our sports agent directory by state to locate agents closest to your school. Then, contact the available agents directly by phone or email to inquire about internship possibilities.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How do I become a sports agent?',
                'answer' => 'To learn how to become a sports agent, we recommend you visit www.become-a-sports-agent.com. This is an easy to follow do-at-your-own-pace online course that can be taken worldwide by individuals of all backgrounds. This course answers all common questions about how to become a sports agent and provides a wealth of information on how to get started in the sports agent industry.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How can I find a professional athlete to do a personal appearance?',
                'answer' => 'To find an athlete for a personal appearance, you must contact their sports agent. If you are seeking an athlete from a specific sport such as baseball, you can search our baseball agent listings and contact these agents directly to find out if their athlete clients would be willing and available to make an appearance.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How can I sell my products and services to professional athletes?',
                'answer' => 'If you would like to sell your products or services, for example: financial services, you will need to contact sports agents first and develop a relationship with them. The sports agent will then be the one to refer you to their athlete clients.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How can I find a professional athlete to do a personal endorsement?',
                'answer' => 'To find an athlete for a product or service endorsement, you must contact their respective sports agent. If you are seeking an athlete from a specific sport such as baseball, you can search our baseball agent listings and contact these agents directly to find out if their athlete clients would be willing and able to endorse your product.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How much do sports agents charge for their services?',
                'answer' => 'Sports agents may charge varying fees. Most commonly, agents will charge a percentage of an athlete contract. Alternatively, some sports agents may charge an hourly fee for their services. In either case, sports agents generally do not collect their fee until the athlete is paid. Depending on the sports league involved, the league may also have additional regulations that govern how a sports agent charges an athlete for their services.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'Which sports agents should I contact?',
                'answer' => 'Due to the nature of our service, we are enable to recommend specific sports agents for you to contact. If you are an athlete in baseball, basketball, football, hockey, soccer, or track & field, you can contact any of the certified agents listed in our directory for these specific sports. For other sports such as motorsports, rodeo, swimming, volleyball, etc., we recommend that you contact any of the sports agencies listed in our directory. There are few professional agents that are dedicated to serving these smaller sports, but many sports agencies do represent athletes from these smaller sports and will consider new athlete clients on a case by case basis.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'Which sports do sports agents represent athletes from?',
                'answer' => 'Sports agents represent athletes from virtually all sports. Most people are familiar with sports agents that represent popular athletes from the major sports leagues such as the MLB, NBA, NFL and NHL. However, agents also represent many other athletes from smaller sports such as bowling, gymnastics, motorsports, rodeo, swimming, track & field, volleyball, Olympic athletes and many more.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'Will you find a sports agent to represent me?',
                'answer' => 'Due to the nature of our business, we are unable to contact sports agents on behalf of any third parties.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How do I find a sports agent to represent me?',
                'answer' => 'First, search our sports agent directory by sport, state or country to view available agents. Next, select a few agents and contact them by phone or by email. When you contact the agent, you will need to provide information such as which sport you play, your height and weight, sprint times if applicable, where you attended school, and summarize your athletic experience. After you explain your situation, the agent will let you know if they are able to help you and how to proceed.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'Can you help me get into team tryouts?',
                'answer' => 'A sports agent can help you locate and qualify for team tryouts. We are not a sports agency ourselves, we provide an online directory of certified sports agents. To find help getting into team tryouts, simply join our directory and use the information we provide to contact sports agents directly.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How can I update my email or password?',
                'answer' => 'To update your email or password, simply login to your account and click the Edit Account link. From there, you can update your email or password.',
                'status' => 'active',
            ],
            [
                'type' => 'general',
                'question' => 'How do I contact technical support?',
                'answer' => 'The majority of the questions we receive are answered on this page. If you have a question that is not answered here or have a question about your account, please Contact Us.',
                'status' => 'active',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'type' => $faq['type'],
                    'answer' => $faq['answer'],
                    'status' => $faq['status'],
                ]
            );
        }
    }
}
