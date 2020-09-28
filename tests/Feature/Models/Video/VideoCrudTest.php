<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;

class VideoCrudTest extends BaseVideoTestCase
{
    private $fileFieldsData = [];
    protected function setUp(): void
    {
        parent::setUp();
        foreach (Video::$fileFields as $field) {
            $this->fileFieldsData[$field] = "$field.test";
        }
    }

    public function testList()
    {
        $video = factory(Video::class, 1)->create()->first();
        $video->refresh();
        $videos = Video::all();
        $this->assertCount(1, $videos);
        $videoKey = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'title', 'description', 'video_file', 'thumb_file', 'trailer_file', 'banner_file', 
            'year_launched', 'opened', 'rating', 'duration', 'created_at', 'updated_at', 'deleted_at'
        ], $videoKey);
    }

    public function testCreate()
    {
        $video = Video::create($this->data + $this->fileFieldsData);
        $video->refresh();

        $this->assertEquals(36, strlen($video->id));
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $this->fileFieldsData + ['opened' => false]);

        $data = [
            'title' => 'title1',
            'description' => 'description1',
            'year_launched' => 2000,
            'rating' => 'L',
            'duration' => 90
        ];

        $video = Video::create($data + ['opened' => true]);
        $video->refresh();

        $this->assertEquals('title1', $video->title);
        $this->assertEquals('description1', $video->description);
        $this->assertEquals(2000, $video->year_launched);
        $this->assertTrue($video->opened);
        $this->assertEquals('L', $video->rating);
        $this->assertEquals(90, $video->duration);
        $this->assertTrue(preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $video->id) === 1);
        $this->assertDatabaseHas('videos', $video->toArray());

        $video = Video::create($data + ['opened' => false]);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', ['opened' => false]);
    }

    public function testCreateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = Video::create($this->data + [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id]
        ]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGenre($video->id, $genre->id);
    }

    public function testUpdate()
    {
        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->data + $this->fileFieldsData);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $this->fileFieldsData + ['opened' => false]);
        $video->refresh();

        $video = factory(Video::class)->create([
            'title' => 'title1',
            'description' => 'description1',
            'year_launched' => 2000,
            'opened' => true,
            'rating' => '10',
            'duration' => 90
        ])->first();

        $data = [
            'title' => 'title_updated',
            'description' => 'description_updated',
            'year_launched' => 2020,
            'opened' => false,
            'rating' => '12',
            'duration' => 115
        ];
        $video->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class, 1)->create()->first();
        $video->refresh();

        $video->delete();
        $videos = Video::all();
        $this->assertCount(0, $videos);
        $this->assertNull(Video::find($video->id));

        $videos = Video::onlyTrashed()->get();
        $this->assertCount(1, $videos);

        $video->restore();
        $this->assertNotNull(Video::find($video->id));
        $this->assertCount(1, $videos);

        $videos = Video::onlyTrashed()->get();
        $this->assertCount(0, $videos);
    }

    public function testRollbackCreate()
    {
        $hasError = false;
        try {
            Video::create([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            $this->assertCount(0, Video::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $video = factory(Video::class)->create();
        $oldTitle = $video->title;

        $hasError = false;
        try {
            $video->update([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            $this->assertDatabaseHas('videos', ['title' => $oldTitle]);
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }

    public function testHandleRelations()
    {
        $video = factory(Video::class)->create();
        Video::handleRelations($video, []);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);

        $category = factory(Category::class)->create();
        Video::handleRelations($video, ['categories_id' => [$category->id]]);
        $video->refresh();
        $this->assertCount(1, $video->categories);

        $genre = factory(Genre::class)->create();
        Video::handleRelations($video, ['genres_id' => [$genre->id]]);
        $video->refresh();
        $this->assertCount(1, $video->genres);

        $video->categories()->delete();
        $video->genres()->delete();

        Video::handleRelations($video, [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genres);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, ['categories_id' => [$categoriesId[0]]]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => [$categoriesId[0]],
            'video_id' => [$video->id]
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);
        $this->assertDatabaseMissing('category_video', [
            'category_id' => [$categoriesId[0]],
            'video_id' => [$video->id]
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => [$categoriesId[1]],
            'video_id' => [$video->id]
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => [$categoriesId[2]],
            'video_id' => [$video->id]
        ]);
    }

    public function testSyncGenres()
    {
        $genresId = factory(Genre::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, ['genres_id' => [$genresId[0]]]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => [$genresId[0]],
            'video_id' => [$video->id]
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);
        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => [$genresId[0]],
            'video_id' => [$video->id]
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => [$genresId[1]],
            'video_id' => [$video->id]
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => [$genresId[2]],
            'video_id' => [$video->id]
        ]);
    }
}
