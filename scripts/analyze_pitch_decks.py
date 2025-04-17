import json
import os

def load_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def extract_key_information():
    analysis_dir = "/home/ubuntu/jade_kite_analysis"
    combined_file = os.path.join(analysis_dir, "combined_analysis.json")
    
    # Load the combined analysis
    combined_data = load_json_file(combined_file)
    
    # Categories to extract
    key_info = {
        "services_and_offerings": [],
        "value_propositions": [],
        "target_markets": [],
        "past_clients": [],
        "case_studies": [],
        "team_information": [],
        "methodologies": [],
        "technologies": [],
        "unique_selling_points": []
    }
    
    # Keywords to look for in slides
    keywords = {
        "services_and_offerings": ["service", "offering", "solution", "product", "provide", "deliver"],
        "value_propositions": ["value", "benefit", "advantage", "impact", "roi", "return", "improve"],
        "target_markets": ["market", "industry", "sector", "client", "customer", "audience", "segment"],
        "past_clients": ["client", "customer", "partner", "work with", "worked with", "portfolio"],
        "case_studies": ["case study", "success story", "project", "result", "outcome"],
        "team_information": ["team", "expert", "specialist", "leadership", "founder", "experience"],
        "methodologies": ["method", "approach", "process", "framework", "strategy", "technique"],
        "technologies": ["technology", "tech", "platform", "tool", "software", "system", "ai", "ml"],
        "unique_selling_points": ["unique", "different", "competitive", "advantage", "usp", "stand out"]
    }
    
    # Process each deck
    for deck_name, slides in combined_data.items():
        print(f"Analyzing key information from: {deck_name}")
        
        for slide in slides:
            slide_title = slide["slide_title"].lower()
            slide_content = " ".join(slide["slide_content"]).lower()
            
            # Check each category
            for category, terms in keywords.items():
                for term in terms:
                    if term in slide_title or term in slide_content:
                        # Extract the slide information
                        info = {
                            "deck": deck_name,
                            "slide_number": slide["slide_number"],
                            "slide_title": slide["slide_title"],
                            "content": slide["slide_content"]
                        }
                        
                        # Add to the appropriate category if not already present
                        if info not in key_info[category]:
                            key_info[category].append(info)
    
    # Save the extracted information
    output_file = os.path.join(analysis_dir, "key_information.json")
    with open(output_file, 'w') as f:
        json.dump(key_info, f, indent=2)
    
    print(f"Saved key information to: {output_file}")
    
    # Create a summary report
    create_summary_report(key_info, analysis_dir)
    
    return key_info

def create_summary_report(key_info, output_dir):
    """Create a human-readable summary report from the extracted key information."""
    report = "# Jade Kite Business Analysis Summary\n\n"
    
    for category, items in key_info.items():
        category_title = category.replace("_", " ").title()
        report += f"## {category_title}\n\n"
        
        if not items:
            report += "No specific information found in the pitch decks.\n\n"
            continue
        
        # Group by deck for better organization
        decks = {}
        for item in items:
            deck_name = item["deck"]
            if deck_name not in decks:
                decks[deck_name] = []
            decks[deck_name].append(item)
        
        # Add information from each deck
        for deck_name, deck_items in decks.items():
            report += f"### From {deck_name}\n\n"
            
            for item in deck_items:
                report += f"**Slide {item['slide_number']}: {item['slide_title']}**\n\n"
                for content in item['content']:
                    if content.strip():
                        report += f"- {content}\n"
                report += "\n"
    
    # Save the report
    report_file = os.path.join(output_dir, "business_analysis_summary.md")
    with open(report_file, 'w') as f:
        f.write(report)
    
    print(f"Saved summary report to: {report_file}")

if __name__ == "__main__":
    extract_key_information()
