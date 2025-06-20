import re
import fitz
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SongExtractor:
    def __init__(self, input_pdf: str, output_dir: str):
        self.input_pdf = input_pdf
        self.output_dir = Path(output_dir)
        
    def extract_text_from_pdf(self) -> str:
        """Extracts text from PDF with error handling."""
        try:
            doc = fitz.open(self.input_pdf)
            text = ""
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text += page.get_text("text")
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise

    def extract_song_content(self, text: str):
        """Extracts songs and formats them according to the specified structure."""
        songs = []
        
        # Clean up the text first
        text = re.sub(r'\n+', '\n', text)  # Remove multiple newlines
        text = text.strip()
        
        # Split by song numbers - looking for standalone numbers on their own lines
        song_sections = re.split(r'\n(\d+)\n', text)
        
        # Remove empty sections
        song_sections = [section.strip() for section in song_sections if section.strip()]
        
        i = 0
        while i < len(song_sections):
            # Check if current section is a number
            if song_sections[i].isdigit():
                song_number = song_sections[i]
                if i + 1 < len(song_sections):
                    song_content = song_sections[i + 1]
                    song = self._process_single_song(song_number, song_content)
                    if song:
                        songs.append(song)
                i += 2
            else:
                # This might be the first song without a number, or content before numbering
                if i == 0:
                    # Try to find the first song in the content
                    first_song = self._extract_first_song(song_sections[i])
                    if first_song:
                        songs.append(first_song)
                i += 1
        
        return songs

    def _extract_first_song(self, content: str):
        """Extract the first song which might not have a number."""
        lines = content.split('\n')
        if lines:
            # Look for the first song title (usually in caps or title case)
            for i, line in enumerate(lines):
                if line.strip() and not line.strip().isdigit():
                    # This could be a song title
                    title = line.strip()
                    remaining_content = '\n'.join(lines[i+1:])
                    formatted_content = self._format_song_content(remaining_content, title)
                    if formatted_content:
                        safe_title = re.sub(r'[<>:"/\\|?*]', '_', title)
                        return (safe_title, formatted_content)
        return None

    def _process_single_song(self, song_number: str, content: str):
        """Process a single song with its number and content."""
        try:
            lines = content.split('\n')
            if not lines:
                return None
            
            # First non-empty line should be the title
            title = None
            content_start_idx = 0
            
            for i, line in enumerate(lines):
                if line.strip():
                    title = line.strip()
                    content_start_idx = i + 1
                    break
            
            if not title:
                return None
            
            # Get the remaining content after title
            remaining_lines = lines[content_start_idx:]
            song_content = '\n'.join(remaining_lines)
            
            # Format the content
            formatted_content = self._format_song_content(song_content, title)
            
            if formatted_content:
                # Clean the title for file naming
                safe_title = re.sub(r'[<>:"/\\|?*]', '_', title)
                return (safe_title, formatted_content)
                
        except Exception as e:
            logger.error(f"Error processing song {song_number}: {e}")
        
        return None

    def _format_song_content(self, content: str, title: str) -> str:
        """Formats song content with proper verse and chorus detection."""
        try:
            # Split content into lines and remove empty lines
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            
            if not lines:
                return ""
            
            formatted_parts = []
            current_section = "verse"
            verse_count = 1
            current_section_lines = []
            
            i = 0
            while i < len(lines):
                line = lines[i]
                
                # Remove key information if present
                if re.match(r'^Key\s+of?\s+[A-G](?:#|b)?(?:m)?', line, re.IGNORECASE):
                    i += 1
                    continue
                
                # Check for chorus/refrain indicators
                if re.match(r'^(CHORUS|REFRAIN)$', line.upper().strip()):
                    # Save current section if it has content
                    if current_section_lines:
                        if current_section == "verse":
                            formatted_parts.append(f'<p>Verse {verse_count}</p>')
                        else:
                            formatted_parts.append(f'<p>Chorus</p>')
                        
                        for section_line in current_section_lines:
                            formatted_parts.append(f'<p>{section_line}</p>')
                        
                        if current_section == "verse":
                            verse_count += 1
                        current_section_lines = []
                    
                    current_section = "chorus"
                    i += 1
                    continue
                
                # Check for verse indicators
                if re.match(r'^(VERSE|V)\s*\d*$', line.upper().strip()):
                    # Save current section if it has content
                    if current_section_lines:
                        if current_section == "verse":
                            formatted_parts.append(f'<p>Verse {verse_count}</p>')
                        else:
                            formatted_parts.append(f'<p>Chorus</p>')
                        
                        for section_line in current_section_lines:
                            formatted_parts.append(f'<p>{section_line}</p>')
                        
                        if current_section == "verse":
                            verse_count += 1
                        current_section_lines = []
                    
                    current_section = "verse"
                    i += 1
                    continue
                
                # Check for verse numbers like "Verse 2", "T2", etc.
                if re.match(r'^(Verse\s+\d+|T\d+|\d+)$', line.strip()):
                    # Save current section if it has content
                    if current_section_lines:
                        if current_section == "verse":
                            formatted_parts.append(f'<p>Verse {verse_count}</p>')
                        else:
                            formatted_parts.append(f'<p>Chorus</p>')
                        
                        for section_line in current_section_lines:
                            formatted_parts.append(f'<p>{section_line}</p>')
                        
                        if current_section == "verse":
                            verse_count += 1
                        current_section_lines = []
                    
                    current_section = "verse"
                    i += 1
                    continue
                
                # Regular content line
                current_section_lines.append(line)
                i += 1
            
            # Handle the last section
            if current_section_lines:
                if current_section == "verse":
                    formatted_parts.append(f'<p>Verse {verse_count}</p>')
                else:
                    formatted_parts.append(f'<p>Chorus</p>')
                
                for section_line in current_section_lines:
                    formatted_parts.append(f'<p>{section_line}</p>')
            
            # If no sections were explicitly marked, treat as verses with intelligent splitting
            if not formatted_parts:
                formatted_parts = self._intelligent_verse_splitting(lines)
            
            return '\n'.join(formatted_parts)
            
        except Exception as e:
            logger.error(f"Error formatting song content: {e}")
            return ""

    def _intelligent_verse_splitting(self, lines):
        """Split content into verses intelligently when no explicit markers exist."""
        formatted_parts = []
        verse_count = 1
        current_verse_lines = []
        
        for line in lines:
            current_verse_lines.append(line)
            
            # Split into new verse after about 4-6 lines or when we detect a pattern break
            if len(current_verse_lines) >= 4:
                # Check if this might be a good place to split
                # (e.g., if the next few lines look like they might be a chorus or new verse)
                formatted_parts.append(f'<p>Verse {verse_count}</p>')
                for verse_line in current_verse_lines:
                    formatted_parts.append(f'<p>{verse_line}</p>')
                
                verse_count += 1
                current_verse_lines = []
        
        # Handle remaining lines
        if current_verse_lines:
            formatted_parts.append(f'<p>Verse {verse_count}</p>')
            for verse_line in current_verse_lines:
                formatted_parts.append(f'<p>{verse_line}</p>')
        
        return formatted_parts

    def save_raw_content(self, content: str, title: str) -> bool:
        """Saves the formatted content to a text file."""
        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self.output_dir / f"{title}.txt"
            
            # Write the formatted content to a text file
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            logger.info(f"Successfully created file: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving file for {title}: {e}")
            return False

def main():
    try:
        input_file = input("Enter the path of the song PDF file: ").strip()
        output_directory = input("Enter the output directory for files: ").strip()
        
        extractor = SongExtractor(input_file, output_directory)
        
        logger.info("Extracting text from PDF...")
        song_text = extractor.extract_text_from_pdf()
        
        logger.info("Processing songs...")
        songs = extractor.extract_song_content(song_text)
        
        successful = 0
        failed = 0
        
        for title, content in songs:
            if extractor.save_raw_content(content, title):
                successful += 1
            else:
                failed += 1
        
        logger.info(f"Process completed. Successfully generated {successful} files, {failed} failed.")
        
        if successful == 0:
            logger.warning("No songs were successfully extracted. Please check the PDF format and try again.")
        
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise

if __name__ == "__main__":
    main()