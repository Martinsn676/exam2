import { useEffect } from "react";

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]); // Run the effect whenever the title changes
}

export default useDocumentTitle;
