import {
  Alert,
  Container,
} from '@mui/material'
import AdminAccessNotice from './admin/AdminAccessNotice'
import AdminCommentsPanel from './admin/AdminCommentsPanel'
import AdminGamesPanel from './admin/AdminGamesPanel'
import AdminGenresPanel from './admin/AdminGenresPanel'
import AdminPageHeader from './admin/AdminPageHeader'
import AdminTabsNav from './admin/AdminTabsNav'
import type { AdminPageProps } from './admin/types'
import useAdminPage from './admin/useAdminPage'

function AdminPage({ userRole, onCatalogChange }: AdminPageProps) {
  const {
    activeTab,
    addGenre,
    cleanupGameFiles,
    cleanupGameId,
    clearForm,
    comments,
    coverFile,
    coverPreviewUrl,
    deleteComment,
    deleteGame,
    deleteGenre,
    editingId,
    form,
    gameList,
    gameTitleById,
    gameZipFile,
    genreList,
    isCoverUploading,
    isGameUploading,
    isLoading,
    message,
    newGenreName,
    refreshAdminData,
    saveGame,
    setActiveTab,
    setCoverFile,
    setCoverPreviewUrl,
    setGameZipFile,
    setMessage,
    setNewGenreName,
    startCreate,
    startEdit,
    updateField,
  } = useAdminPage(userRole, onCatalogChange)

  if (userRole !== 'admin') {
    return <AdminAccessNotice />
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <AdminPageHeader onRefresh={refreshAdminData} />

      {message && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <AdminTabsNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'games' && (
        <AdminGamesPanel
          form={form}
          editingId={editingId}
          gameList={gameList}
          genreList={genreList}
          coverFile={coverFile}
          coverPreviewUrl={coverPreviewUrl}
          gameZipFile={gameZipFile}
          isCoverUploading={isCoverUploading}
          isGameUploading={isGameUploading}
          updateField={updateField}
          startCreate={startCreate}
          startEdit={startEdit}
          clearForm={clearForm}
          saveGame={saveGame}
          deleteGame={deleteGame}
          cleanupGameFiles={cleanupGameFiles}
          cleanupGameId={cleanupGameId}
          setCoverFile={setCoverFile}
          setCoverPreviewUrl={setCoverPreviewUrl}
          setGameZipFile={setGameZipFile}
          setMessage={setMessage}
        />
      )}

      {activeTab === 'genres' && (
        <AdminGenresPanel
          genreList={genreList}
          newGenreName={newGenreName}
          setNewGenreName={setNewGenreName}
          setMessage={setMessage}
          addGenre={addGenre}
          deleteGenre={deleteGenre}
        />
      )}

      {activeTab === 'comments' && (
        <AdminCommentsPanel
          comments={comments}
          gameTitleById={gameTitleById}
          isLoading={isLoading}
          deleteComment={deleteComment}
        />
      )}
    </Container>
  )
}

export default AdminPage
