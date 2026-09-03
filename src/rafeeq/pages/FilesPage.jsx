import { FilesScreen } from '../screens/Files.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';

export default function FilesPage() {
  const { t, lang, docs, userDocuments, openDocumentFile, openAttachment } = useRafeeq();
  return (
    <FilesScreen
      t={t} lang={lang} docs={docs}
      userDocs={userDocuments}
      onOpenAttachment={openAttachment}
      onOpenFile={openDocumentFile}
      onHome={() => { window.location.hash = `#/${lang}/rafeeq`; }}
    />
  );
}
